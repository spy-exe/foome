from pydantic import BaseModel, ConfigDict


class MenuItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    restaurant_id: int
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    category: str | None = None
    is_available: bool


class RestaurantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    description: str | None = None
    image_url: str | None = None
    address: str | None = None
    lat: float | None = None
    lng: float | None = None
    is_open: bool
    delivery_time_min: int
    delivery_fee: float
    min_order: float
    rating: float


class RestaurantDetail(RestaurantOut):
    menu_items: list[MenuItemOut] = []
