import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.core.errors import NotFoundError
from app.schemas.plano_sucesso import PlanoSucessoRead, PlanoSucessoUpsert
from app.services import plano_sucesso_service

router = APIRouter(tags=["success-plan"], dependencies=[Depends(get_current_user)])


@router.get("/clients/{client_id}/success-plan", response_model=PlanoSucessoRead)
async def get_success_plan(client_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    plano = await plano_sucesso_service.get_active_plano(session, client_id)
    if plano is None:
        raise NotFoundError("Este cliente ainda não tem um plano de sucesso")
    return plano


@router.put("/clients/{client_id}/success-plan", response_model=PlanoSucessoRead)
async def upsert_success_plan(
    client_id: uuid.UUID,
    payload: PlanoSucessoUpsert,
    session: AsyncSession = Depends(get_session),
):
    return await plano_sucesso_service.upsert_plano(session, client_id, payload)
