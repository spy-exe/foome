from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant
from app.schemas.restaurant import MenuItemOut, RestaurantDetail, RestaurantOut

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("", response_model=list[RestaurantOut])
def list_restaurants(
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(Restaurant)
    if category:
        stmt = stmt.where(Restaurant.category == category)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(or_(Restaurant.name.ilike(like), Restaurant.category.ilike(like)))
    return db.scalars(stmt.order_by(Restaurant.rating.desc())).all()


@router.get("/{restaurant_id}", response_model=RestaurantDetail)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.scalar(
        select(Restaurant)
        .where(Restaurant.id == restaurant_id)
        .options(selectinload(Restaurant.menu_items))
    )
    if not restaurant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Restaurante não encontrado")
    return restaurant


@router.get("/{restaurant_id}/menu", response_model=list[MenuItemOut])
def get_menu(restaurant_id: int, db: Session = Depends(get_db)):
    if not db.get(Restaurant, restaurant_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Restaurante não encontrado")
    return db.scalars(
        select(MenuItem).where(MenuItem.restaurant_id == restaurant_id).order_by(MenuItem.id)
    ).all()
