import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.models.usuario import Usuario
from app.schemas.memoria import MemoriaCreate, MemoriaRead
from app.services import memoria_service

router = APIRouter(tags=["memories"], dependencies=[Depends(get_current_user)])


@router.get("/clients/{client_id}/memories", response_model=list[MemoriaRead])
async def list_memories(client_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await memoria_service.list_memorias(session, client_id)


@router.post("/memories", response_model=MemoriaRead, status_code=201)
async def create_memory(
    payload: MemoriaCreate,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    return await memoria_service.create_memoria(session, payload, criado_por=usuario.email)
