# Foome API (backend)

FastAPI + PostgreSQL + SQLAlchemy + Alembic, containerizado.

## Subir (a partir da raiz do repo)

```bash
docker compose up -d db api
```

- API: http://localhost:8000
- Swagger / docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

O container, ao subir, espera o Postgres, aplica as migrations (`alembic upgrade head`)
e roda o seed (8 restaurantes + cardápios). O seed é idempotente.

## Variáveis de ambiente

Veja `.env.example`. Em Docker, o `docker-compose.yml` já injeta `DATABASE_URL` e `JWT_SECRET`.

| Var | Default |
|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://foome:foome@db:5432/foome` |
| `JWT_SECRET` | (troque em produção) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 1440 |
| `REFRESH_TOKEN_EXPIRE_MINUTES` | 43200 |

## Estrutura

```
app/
  core/        config, database, security (JWT + bcrypt)
  models/      SQLAlchemy: User, Address, Restaurant, MenuItem, Order, OrderItem, OrderStatusHistory
  schemas/     Pydantic
  routers/     auth, users, addresses, restaurants, orders
  main.py      app + CORS + rotas
  seed.py      popula restaurantes/cardápios
alembic/       migrations
```

## Endpoints principais

- `POST /auth/register` · `POST /auth/login` (form: username=email) · `POST /auth/refresh` · `GET /auth/me`
- `GET /restaurants?category=&search=` · `GET /restaurants/{id}` · `GET /restaurants/{id}/menu`
- `POST /orders` · `GET /orders` · `GET /orders/{id}`
- `PATCH /orders/{id}/status` (avança na máquina de estados)
- `POST /orders/{id}/confirm-delivery` (valida o `delivery_code` → DELIVERED)
- CRUD `/addresses`

## Máquina de estados do pedido

`PENDING → ACCEPTED → PREPARING → READY → IN_DELIVERY → DELIVERED`

Cada transição grava timestamp em `order_status_history`. O passo final
(`IN_DELIVERY → DELIVERED`) só ocorre via `confirm-delivery` com o código de 4 dígitos
gerado na criação do pedido.

## Gerar nova migration (após mudar models)

```bash
docker compose run --rm --entrypoint "" api sh -c "alembic revision --autogenerate -m 'descricao'"
```
