import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.risco import RiscoCreate, RiscoRead, RiscoResumo, RiscoUpdate
from app.services import risco_service

router = APIRouter(tags=["risks"], dependencies=[Depends(get_current_user)])


@router.get("/risks", response_model=list[RiscoResumo])
async def list_risks_carteira(session: AsyncSession = Depends(get_session)):
    return await risco_service.list_riscos_carteira(session)


@router.get("/clients/{client_id}/risks", response_model=list[RiscoRead])
async def list_risks(client_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await risco_service.list_riscos(session, client_id)


@router.post("/clients/{client_id}/risks", response_model=RiscoRead, status_code=201)
async def create_risk(
    client_id: uuid.UUID, payload: RiscoCreate, session: AsyncSession = Depends(get_session)
):
    return await risco_service.create_risco(session, client_id, payload)


@router.put("/risks/{risk_id}", response_model=RiscoRead)
async def update_risk(
    risk_id: uuid.UUID, payload: RiscoUpdate, session: AsyncSession = Depends(get_session)
):
    return await risco_service.update_risco(session, risk_id, payload)


@router.delete("/risks/{risk_id}", status_code=204)
async def delete_risk(risk_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    await risco_service.delete_risco(session, risk_id)
