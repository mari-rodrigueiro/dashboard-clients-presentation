import logging
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routers import (
    actions,
    ai,
    auth,
    clientes,
    dashboard,
    evolutions,
    gps,
    health,
    import_cliente,
    memories,
    opportunities,
    risks,
    success_plan,
)
from app.core.config import get_settings
from app.core.errors import DomainError
from app.core.logging import configure_logging, request_id_var
from app.db.session import AsyncSessionLocal
from app.services.auth.service import seed_admin_user_if_needed

settings = get_settings()
configure_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as session:
        await seed_admin_user_if_needed(session)
    yield


app = FastAPI(title="CS Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """SPECS.md §18 — correlaciona todos os logs de uma mesma requisição."""
    request_id = str(uuid.uuid4())
    token = request_id_var.set(request_id)
    try:
        response = await call_next(request)
    finally:
        request_id_var.reset(token)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Erro não tratado em %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Erro interno do servidor"})


api_v1_prefix = "/api/v1"
app.include_router(health.router, prefix=api_v1_prefix)
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(gps.router, prefix=api_v1_prefix)
app.include_router(clientes.router, prefix=api_v1_prefix)
app.include_router(import_cliente.router, prefix=api_v1_prefix)
app.include_router(success_plan.router, prefix=api_v1_prefix)
app.include_router(risks.router, prefix=api_v1_prefix)
app.include_router(opportunities.router, prefix=api_v1_prefix)
app.include_router(evolutions.router, prefix=api_v1_prefix)
app.include_router(actions.router, prefix=api_v1_prefix)
app.include_router(dashboard.router, prefix=api_v1_prefix)
app.include_router(ai.router, prefix=api_v1_prefix)
app.include_router(memories.router, prefix=api_v1_prefix)
