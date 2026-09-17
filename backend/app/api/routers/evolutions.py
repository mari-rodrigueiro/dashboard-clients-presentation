import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.evolucao import EvolucaoCreate, EvolucaoRead, EvolucaoUpdate
from app.services import evolucao_service

router = APIRouter(tags=["evolutions"], dependencies=[Depends(get_current_user)])


@router.get("/clients/{client_id}/evolutions", response_model=list[EvolucaoRead])
async def list_evolutions(client_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await evolucao_service.list_evolucoes(session, client_id)


@router.post("/clients/{client_id}/evolutions", response_model=EvolucaoRead, status_code=201)
async def create_evolution(
    client_id: uuid.UUID, payload: EvolucaoCreate, session: AsyncSession = Depends(get_session)
):
    return await evolucao_service.create_evolucao(session, client_id, payload)


@router.put("/evolutions/{evolution_id}", response_model=EvolucaoRead)
async def update_evolution(
    evolution_id: uuid.UUID,
    payload: EvolucaoUpdate,
    session: AsyncSession = Depends(get_session),
):
    return await evolucao_service.update_evolucao(session, evolution_id, payload)
