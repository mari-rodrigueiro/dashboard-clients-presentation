import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.cliente import ClienteCreate, ClienteRead, ClienteUpdate
from app.services import cliente_service

router = APIRouter(
    prefix="/clients", tags=["clients"], dependencies=[Depends(get_current_user)]
)


@router.get("", response_model=list[ClienteRead])
async def list_clients(session: AsyncSession = Depends(get_session)):
    return await cliente_service.list_clientes(session)


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
