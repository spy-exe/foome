from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(default=1, ge=1)
    notes: str | None = None


class OrderCreate(BaseModel):
    restaurant_id: int
    items: list[OrderItemCreate] = Field(min_length=1)
    delivery_address: str | None = None
    payment_method: str | None = None
    coupon_code: str | None = Field(default=None, max_length=30)
    discount_total: float = Field(default=0, ge=0)
    free_delivery: bool = False


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_item_id: int
    name: str | None = None
    quantity: int
    unit_price: float
    notes: str | None = None


class OrderStatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: OrderStatus
    timestamp: datetime


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    restaurant_id: int
    restaurant_name: str | None = None
    restaurant_category: str | None = None
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    discount_total: float = 0
    total: float
    coupon_code: str | None = None
    delivery_address: str | None = None
    payment_method: str | None = None
    delivery_code: str
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemOut] = []
    history: list[OrderStatusHistoryOut] = []


class StatusUpdateRequest(BaseModel):
    # Opcional: se informado, precisa ser exatamente o próximo estado válido.
    status: OrderStatus | None = None


class ConfirmDeliveryRequest(BaseModel):
    delivery_code: str = Field(min_length=4, max_length=4)
