from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import addresses, auth, orders, restaurants, users

app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    description="Backend do Foome — delivery de comida.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(addresses.router)
app.include_router(restaurants.router)
app.include_router(orders.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": settings.project_name}
