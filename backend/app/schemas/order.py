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


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    menu_item_id: int
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
    status: OrderStatus
    subtotal: float
    delivery_fee: float
    total: float
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
