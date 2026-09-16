#!/bin/sh
set -e

echo "Aplicando migrations..."
until alembic upgrade head; do
  echo "Banco ainda não disponível, tentando novamente em 2s..."
  sleep 2
done

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
