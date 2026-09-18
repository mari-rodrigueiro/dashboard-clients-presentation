import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.oportunidade import OportunidadeCreate, OportunidadeRead, OportunidadeUpdate
from app.services import oportunidade_service

router = APIRouter(tags=["opportunities"], dependencies=[Depends(get_current_user)])


@router.get("/clients/{client_id}/opportunities", response_model=list[OportunidadeRead])
async def list_opportunities(client_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await oportunidade_service.list_oportunidades(session, client_id)


@router.post("/clients/{client_id}/opportunities", response_model=OportunidadeRead, status_code=201)
async def create_opportunity(
    client_id: uuid.UUID,
    payload: OportunidadeCreate,
    session: AsyncSession = Depends(get_session),
):
    return await oportunidade_service.create_oportunidade(session, client_id, payload)


@router.put("/opportunities/{opportunity_id}", response_model=OportunidadeRead)
async def update_opportunity(
    opportunity_id: uuid.UUID,
    payload: OportunidadeUpdate,
    session: AsyncSession = Depends(get_session),
):
    return await oportunidade_service.update_oportunidade(session, opportunity_id, payload)


@router.delete("/opportunities/{opportunity_id}", status_code=204)
async def delete_opportunity(
    opportunity_id: uuid.UUID, session: AsyncSession = Depends(get_session)
):
    await oportunidade_service.delete_oportunidade(session, opportunity_id)
