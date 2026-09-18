import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.models.cliente import FaseCliente, HealthStatus
from app.schemas.cliente import ClienteCreate, ClienteRead, ClienteUpdate
from app.services import cliente_service

router = APIRouter(prefix="/clients", tags=["clients"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[ClienteRead])
async def list_clients(
    gp_id: uuid.UUID | None = None,
    fase: FaseCliente | None = None,
    health_status: HealthStatus | None = None,
    q: str | None = Query(default=None, description="Busca por nome (case-insensitive)"),
    ativo: bool = Query(default=True, description="true = ativos (padrão), false = inativos"),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: AsyncSession = Depends(get_session),
):
    return await cliente_service.list_clientes(
        session,
        gp_id=gp_id,
        fase=fase,
        health_status=health_status,
        q=q,
        ativo=ativo,
        limit=limit,
        offset=offset,
    )


@router.get("/{client_id}", response_model=ClienteRead)
async def get_client(client_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await cliente_service.get_cliente(session, client_id)


@router.post("", response_model=ClienteRead, status_code=201)
async def create_client(payload: ClienteCreate, session: AsyncSession = Depends(get_session)):
    return await cliente_service.create_cliente(session, payload)


@router.put("/{client_id}", response_model=ClienteRead)
async def update_client(
    client_id: uuid.UUID,
    payload: ClienteUpdate,
    session: AsyncSession = Depends(get_session),
):
    return await cliente_service.update_cliente(session, client_id, payload)
