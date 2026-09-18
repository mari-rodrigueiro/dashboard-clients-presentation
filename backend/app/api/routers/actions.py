import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.acao import AcaoCreate, AcaoRead, AcaoUpdate
from app.services import acao_service

router = APIRouter(tags=["actions"], dependencies=[Depends(get_current_user)])


@router.get("/clients/{client_id}/actions", response_model=list[AcaoRead])
async def list_actions(client_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    return await acao_service.list_acoes(session, client_id)


@router.post("/clients/{client_id}/actions", response_model=AcaoRead, status_code=201)
async def create_action(
    client_id: uuid.UUID, payload: AcaoCreate, session: AsyncSession = Depends(get_session)
):
    return await acao_service.create_acao(session, client_id, payload)


@router.put("/actions/{action_id}", response_model=AcaoRead)
async def update_action(
    action_id: uuid.UUID, payload: AcaoUpdate, session: AsyncSession = Depends(get_session)
):
    return await acao_service.update_acao(session, action_id, payload)


@router.delete("/actions/{action_id}", status_code=204)
async def delete_action(action_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    await acao_service.delete_acao(session, action_id)
