# Foome 🍔

> Aplicativo de **delivery de comida** — projeto acadêmico full-stack.
> App mobile em **React Native (Expo)** consumindo uma **API REST própria** em **FastAPI + PostgreSQL**.

O app cobre o fluxo completo de um delivery real: cadastro/login com **JWT**, catálogo de
restaurantes e cardápios, carrinho, cupons, endereços, checkout com **confirmação biométrica**,
acompanhamento de pedido por **máquina de estados** e mapa com restaurantes próximos.

---

## Sumário

- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [1. Subir o backend (API + banco)](#1-subir-o-backend-api--banco)
- [2. Rodar o app (Expo)](#2-rodar-o-app-expo)
- [3. Rodar os testes](#3-rodar-os-testes)
- [4. Build / deploy (APK)](#4-build--deploy-apk)
- [Inspecionar o banco de dados](#inspecionar-o-banco-de-dados)
- [API e estados do pedido](#api-e-estados-do-pedido)
- [Documentação adicional](#documentação-adicional)

---

## Stack

| Camada | Tecnologias |
|---|---|
| **App (mobile)** | Expo SDK 54, React Native 0.81, React 19, React Navigation, Axios |
| **Recursos nativos** | Câmera, biometria (Face ID / digital), GPS/localização, mapas, haptics |
| **Backend (API)** | FastAPI, SQLAlchemy 2, Alembic, Pydantic 2 |
| **Banco** | PostgreSQL 16 |
| **Auth** | JWT (access + refresh) com senha em hash bcrypt |
| **Infra** | Docker + Docker Compose |
| **Testes** | Jest + Testing Library (unitário/integração) · Maestro (E2E) |

---

## Estrutura do projeto

```
foome/
├── App.js, index.js          # entrada do app Expo
├── app.json, eas.json        # config Expo / EAS Build
├── assets/                   # ícones, splash, imagens
├── components/               # componentes de UI reutilizáveis
├── screens/                  # telas (Home, Restaurante, Carrinho, Pedidos, Mapa, Perfil…)
├── navigation/               # navegação (React Navigation)
├── contexts/                 # estado global (Auth, Carrinho, Tema)
├── services/                 # camada de API (axios) + adapters + auth + storage
├── constants/                # tema, cores, tipografia
├── hooks/, utils/            # hooks e utilitários
├── __tests__/                # testes Jest (componentes, services, integração)
├── .maestro/                 # fluxos E2E (Maestro)
│
├── backend/                  # API FastAPI (ver backend/README.md)
│   ├── app/
│   │   ├── core/             # config, database, security (JWT + bcrypt)
│   │   ├── models/           # SQLAlchemy: User, Address, Restaurant, MenuItem, Order…
│   │   ├── schemas/          # Pydantic
│   │   ├── routers/          # auth, users, addresses, restaurants, orders
│   │   ├── main.py           # app + CORS + rotas
│   │   └── seed.py           # popula 8 restaurantes + cardápios
│   ├── alembic/              # migrations
│   └── Dockerfile
│
├── docker-compose.yml        # sobe db + api (+ landing opcional)
├── docs/                     # documentação (marca, design system, fluxos…)
└── landing/                  # landing page de marketing (Next.js) — opcional
```

---

## Pré-requisitos

- **Docker** + **Docker Compose** (para o backend e o banco)
- **Node.js 20 LTS** + npm (para o app)
- **App Expo Go** no celular (Android/iOS) **ou** um emulador Android / simulador iOS
- O celular e o computador na **mesma rede Wi-Fi** (para testar em device físico)

> Recursos nativos (câmera, biometria, GPS, mapas) só funcionam em **celular real** ou em um
> **dev build (EAS)** — não funcionam no navegador.

---

## 1. Subir o backend (API + banco)

Na raiz do repositório:

```bash
docker compose up -d db api
```

Ao subir, o container **espera o Postgres ficar pronto**, aplica as **migrations**
(`alembic upgrade head`) e roda o **seed** (8 restaurantes + cardápios). O seed é idempotente.

Verifique se está no ar:

| O quê | URL |
|---|---|
| Health check | http://localhost:8000/health |
| **Documentação interativa (Swagger)** | http://localhost:8000/docs |
| Lista de restaurantes | http://localhost:8000/restaurants |

```bash
# teste rápido
curl http://localhost:8000/health      # -> {"status":"ok","service":"Foome"}
```

Para parar: `docker compose down` (mantém os dados) · `docker compose down -v` (apaga o banco).

---

## 2. Rodar o app (Expo)

```bash
npm install
npx expo start
```

Isso abre o **Metro bundler** com um **QR Code**.

### Configurar a URL da API

O app lê a variável `EXPO_PUBLIC_API_URL`. Copie o exemplo e ajuste conforme onde vai testar:

```bash
cp .env.example .env
```

| Onde você vai abrir o app | `EXPO_PUBLIC_API_URL` |
|---|---|
| Navegador / simulador iOS | `http://localhost:8000` |
| Emulador Android | `http://10.0.2.2:8000` |
| **Celular físico (Expo Go)** | `http://SEU_IP_LOCAL:8000` (ex.: `http://192.168.0.10:8000`) |

> Descubra seu IP local com `ip addr` (Linux) / `ifconfig` (macOS) / `ipconfig` (Windows).
> Depois de editar o `.env`, reinicie o `npx expo start`.

### Abrir no celular

1. Instale o **Expo Go** (Play Store / App Store).
2. Rode `npx expo start`.
3. **Android:** escaneie o QR Code pelo Expo Go. **iOS:** escaneie pela câmera.
4. O app abre consumindo a API que está rodando no seu computador.

---

## 3. Rodar os testes

### Unitários e de integração (Jest)

```bash
npm test
```

Roda a suíte com cobertura (componentes, services e fluxo de login de integração).

```bash
npm run test:watch   # modo watch durante o desenvolvimento
```

### End-to-end (Maestro) — opcional

Fluxos E2E reais (auth, navegação, pedido, perfil, rastreio) ficam em `.maestro/`.
Exigem **backend no ar** + **app rodando em um device/emulador**. Detalhes em
[`docs/MAESTRO.md`](docs/MAESTRO.md).

```bash
maestro test .maestro/flow-order.yaml
```

---

## 4. Build / deploy (APK)

O projeto usa **EAS Build** (perfis em `eas.json`). Para gerar um **APK** instalável
(sem precisar do Metro rodando na hora da demonstração):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

> O perfil `preview` gera um **APK** (`distribution: internal`). O `production` gera um
> **app-bundle** (.aab) para a Play Store. Lembre de apontar `EXPO_PUBLIC_API_URL` (em
> `eas.json`) para uma API acessível pela internet quando for distribuir.

---

## Inspecionar o banco de dados

Para visualizar as tabelas/dados (ex.: mostrar o banco populado):

**Opção A — psql (linha de comando):**

```bash
docker compose exec db psql -U foome -d foome -c "\dt"           # lista tabelas
docker compose exec db psql -U foome -d foome -c "SELECT name, category, rating FROM restaurants;"
```

**Opção B — Adminer (interface web), na mesma rede do compose:**

```bash
docker run --rm -d --name foome_adminer \
  --network foome_default -p 8080:8080 \
  -e ADMINER_DEFAULT_SERVER=db adminer
```

Acesse http://localhost:8080 → Sistema **PostgreSQL**, Servidor **db**, Usuário/Senha/Base **foome**.

---

## API e estados do pedido

Principais endpoints (documentação completa e testável em `/docs`):

- **Auth:** `POST /auth/register` · `POST /auth/login` (form: `username`=email) · `POST /auth/refresh` · `GET /auth/me`
- **Usuário:** `GET/PATCH /users/me` · `PUT /users/me/password` · `DELETE /users/me`
- **Restaurantes:** `GET /restaurants?category=&search=` · `GET /restaurants/{id}` · `GET /restaurants/{id}/menu`
- **Pedidos:** `POST /orders` · `GET /orders` · `GET /orders/{id}` · `PATCH /orders/{id}/status` · `POST /orders/{id}/confirm-delivery`
- **Endereços:** CRUD em `/addresses`

**Máquina de estados do pedido:**

```
PENDING → ACCEPTED → PREPARING → READY → IN_DELIVERY → DELIVERED
```

Cada transição grava um timestamp no histórico. O passo final (`IN_DELIVERY → DELIVERED`) só
acontece via `confirm-delivery`, validando o **código de 4 dígitos** gerado na criação do pedido.

Mais detalhes da API em [`backend/README.md`](backend/README.md).

---

## Documentação adicional

A pasta [`docs/`](docs/) contém a documentação de produto e design do projeto:

| Documento | Conteúdo |
|---|---|
| [`docs/DEMO.md`](docs/DEMO.md) | Roteiro de demonstração ponta a ponta |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Cores, tipografia, componentes |
| [`docs/BRAND.md`](docs/BRAND.md) · [`docs/BRAND_VOICE.md`](docs/BRAND_VOICE.md) | Identidade e voz da marca |
| [`docs/UX_FLOWS.md`](docs/UX_FLOWS.md) | Fluxos de navegação |
| [`docs/SCREEN_INVENTORY.md`](docs/SCREEN_INVENTORY.md) | Inventário das telas |
| [`docs/MICROCOPY.md`](docs/MICROCOPY.md) | Todos os textos do app |
| [`docs/MAESTRO.md`](docs/MAESTRO.md) | Como rodar os testes E2E |

---

<sub>Projeto desenvolvido para fins acadêmicos.</sub>
