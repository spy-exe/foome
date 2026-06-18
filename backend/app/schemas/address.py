from pydantic import BaseModel, ConfigDict


class AddressBase(BaseModel):
    label: str | None = None
    street: str
    number: str
    complement: str | None = None
    neighborhood: str | None = None
    cep: str | None = None
    reference: str | None = None
    lat: float | None = None
    lng: float | None = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    label: str | None = None
    street: str | None = None
    number: str | None = None
    complement: str | None = None
    neighborhood: str | None = None
    cep: str | None = None
    reference: str | None = None
    lat: float | None = None
    lng: float | None = None
    is_default: bool | None = None


class AddressOut(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
