import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.menu_item import MenuItem
from app.models.order import NEXT_STATUS, Order, OrderItem, OrderStatus, OrderStatusHistory
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.order import (
    ConfirmDeliveryRequest,
    OrderCreate,
    OrderOut,
    StatusUpdateRequest,
)

router = APIRouter(prefix="/orders", tags=["orders"])

_TERMINAL = {OrderStatus.DELIVERED, OrderStatus.CANCELLED}
_SIZE_FACTORS = {"P": 1.0, "M": 1.2, "G": 1.4}


def _gen_delivery_code() -> str:
    return f"{random.randint(0, 9999):04d}"


def _price_for_size(base_price: float, size: str | None) -> float:
    factor = _SIZE_FACTORS.get((size or "P").upper(), 1.0)
    return round(float(base_price) * factor, 2)


def _notes_with_size(size: str | None, notes: str | None) -> str:
    selected = (size or "P").upper()
    extra = (notes or "").strip()
    return f"Tamanho: {selected}" + (f"\n{extra}" if extra else "")


def _load_order(order_id: int, user: User, db: Session) -> Order:
    order = db.scalar(
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.menu_item),
            selectinload(Order.history),
            selectinload(Order.restaurant),
        )
    )
    if not order or order.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido não encontrado")
    return order


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.get(Restaurant, payload.restaurant_id)
    if not restaurant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Restaurante não encontrado")
    if not restaurant.is_open:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Restaurante fechado no momento")

    # Carrega os itens do menu de uma vez e valida pertencimento/disponibilidade.
    ids = [i.menu_item_id for i in payload.items]
    menu = {
        m.id: m
        for m in db.scalars(select(MenuItem).where(MenuItem.id.in_(ids))).all()
    }

    subtotal = 0.0
    order_items: list[OrderItem] = []
    for item in payload.items:
        menu_item = menu.get(item.menu_item_id)
        if not menu_item or menu_item.restaurant_id != restaurant.id:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Item {item.menu_item_id} não pertence a este restaurante",
            )
        if not menu_item.is_available:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST, f"Item '{menu_item.name}' indisponível"
            )
        unit_price = _price_for_size(float(menu_item.price), item.size)
        subtotal += unit_price * item.quantity
        order_items.append(
            OrderItem(
                menu_item_id=menu_item.id,
                quantity=item.quantity,
                unit_price=unit_price,
                notes=_notes_with_size(item.size, item.notes),
            )
        )

    delivery_fee_base = float(restaurant.delivery_fee or 0)
    delivery_fee = 0.0 if payload.free_delivery else delivery_fee_base
    discount_total = round(float(payload.discount_total or 0), 2)
    if subtotal < float(restaurant.min_order or 0):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Pedido mínimo de R$ {float(restaurant.min_order):.2f}",
        )
    if discount_total > subtotal + delivery_fee:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Desconto maior que o total do pedido")
    if (discount_total > 0 or payload.free_delivery) and not payload.coupon_code:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cupom obrigatório para aplicar desconto")

    # Transação atômica: ou cria pedido + itens + histórico, ou nada.
    try:
        order = Order(
            user_id=current.id,
            restaurant_id=restaurant.id,
            status=OrderStatus.PENDING.value,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount_total=discount_total,
            total=max(subtotal + delivery_fee - discount_total, 0),
            coupon_code=payload.coupon_code,
            delivery_address=payload.delivery_address,
            payment_method=payload.payment_method,
            delivery_code=_gen_delivery_code(),
            items=order_items,
            history=[OrderStatusHistory(status=OrderStatus.PENDING.value)],
        )
        db.add(order)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Falha ao criar pedido")

    return _load_order(order.id, current, db)


@router.get("", response_model=list[OrderOut])
def list_orders(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(Order)
        .where(Order.user_id == current.id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.menu_item),
            selectinload(Order.history),
            selectinload(Order.restaurant),
        )
        .order_by(Order.created_at.desc())
    ).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _load_order(order_id, current, db)


@router.patch("/{order_id}/status", response_model=OrderOut)
def advance_status(
    order_id: int,
    payload: StatusUpdateRequest | None = None,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = _load_order(order_id, current, db)
    current_status = OrderStatus(order.status)
    desired = payload.status if payload else None

    if current_status in _TERMINAL:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, f"Pedido já está em estado final ({order.status})"
        )

    # O passo final (IN_DELIVERY -> DELIVERED) só acontece via /confirm-delivery
    # com o código de entrega — não pode ser pulado por aqui.
    if current_status == OrderStatus.IN_DELIVERY:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Use POST /orders/{id}/confirm-delivery com o código para finalizar a entrega",
        )

    next_status = NEXT_STATUS[current_status]
    if desired is not None and desired != next_status:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Transição inválida: {current_status.value} → {desired.value}. "
            f"Próximo válido: {next_status.value}",
        )

    order.status = next_status.value
    order.history.append(OrderStatusHistory(status=next_status.value))
    db.commit()
    return _load_order(order.id, current, db)


@router.post("/{order_id}/confirm-delivery", response_model=OrderOut)
def confirm_delivery(
    order_id: int,
    payload: ConfirmDeliveryRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = _load_order(order_id, current, db)

    if OrderStatus(order.status) != OrderStatus.IN_DELIVERY:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "O pedido precisa estar 'IN_DELIVERY' para confirmar a entrega",
        )
    if payload.delivery_code != order.delivery_code:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Código de entrega incorreto")

    order.status = OrderStatus.DELIVERED.value
    order.history.append(OrderStatusHistory(status=OrderStatus.DELIVERED.value))
    db.commit()
    return _load_order(order.id, current, db)
