from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, hash_password, verify_password
from app.models.order import Order
from app.models.user import User
from app.schemas.user import PasswordChange, UserOut, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current: User = Depends(get_current_user)):
    return current


@router.patch("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.name is not None:
        current.name = payload.name.strip()
    if payload.phone is not None:
        current.phone = payload.phone
    if payload.email is not None:
        email = payload.email.strip().lower()
        if email != current.email:
            taken = db.scalar(
                select(User).where(User.email == email, User.id != current.id)
            )
            if taken:
                raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já cadastrado")
            current.email = email
    db.commit()
    db.refresh(current)
    return current


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: PasswordChange,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.current_password, current.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Senha atual incorreta")
    current.password_hash = hash_password(payload.new_password)
    db.commit()


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Remove os pedidos (e itens/histórico via cascade) e endereços antes do
    # usuário, liberando o e-mail para novo cadastro.
    for order in list(current.orders):
        db.delete(order)
    db.delete(current)
    db.commit()
