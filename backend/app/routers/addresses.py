from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressOut, AddressUpdate

router = APIRouter(prefix="/addresses", tags=["addresses"])


def _get_owned(address_id: int, user: User, db: Session) -> Address:
    address = db.get(Address, address_id)
    if not address or address.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Endereço não encontrado")
    return address


def _clear_defaults(user_id: int, db: Session) -> None:
    for addr in db.scalars(select(Address).where(Address.user_id == user_id)):
        addr.is_default = False


@router.get("", response_model=list[AddressOut])
def list_addresses(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(
        select(Address).where(Address.user_id == current.id).order_by(Address.id)
    ).all()


@router.post("", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
def create_address(
    payload: AddressCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.is_default:
        _clear_defaults(current.id, db)
    address = Address(user_id=current.id, **payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.patch("/{address_id}", response_model=AddressOut)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = _get_owned(address_id, current, db)
    data = payload.model_dump(exclude_unset=True)
    if data.get("is_default"):
        _clear_defaults(current.id, db)
    for key, value in data.items():
        setattr(address, key, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address = _get_owned(address_id, current, db)
    db.delete(address)
    db.commit()
