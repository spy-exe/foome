#!/bin/sh
set -e

echo "[entrypoint] Aguardando o banco de dados..."
python - <<'PY'
import time
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

for attempt in range(40):
    try:
        engine = create_engine(settings.database_url)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("[entrypoint] Banco disponível.")
        break
    except Exception:
        time.sleep(1)
else:
    print("[entrypoint] Banco indisponível após 40s.")
    sys.exit(1)
PY

echo "[entrypoint] Aplicando migrations..."
alembic upgrade head

echo "[entrypoint] Rodando seed..."
python -m app.seed

echo "[entrypoint] Iniciando API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
