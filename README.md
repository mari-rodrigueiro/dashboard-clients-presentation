# dashboard-clients-presentation

Dashboard de Customer Success. Ver `SPECS.md` para produto/arquitetura e `CLAUDE.md` para o guia de desenvolvimento.

## Como rodar (execução local, sem Docker)

1. Copie `.env.example` para `.env` e preencha `ADMIN_EMAIL`, `ADMIN_SEED_PASSWORD` e `OPENAI_API_KEY`.

2. Backend:
   ```
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```
   API disponível em `http://localhost:8000/api/v1`.

3. Frontend (em outro terminal):
   ```
   cd frontend
   npm install
   npm run dev
   ```
   App disponível em `http://localhost:5173`.

## Testes

```
cd backend
pytest
```
