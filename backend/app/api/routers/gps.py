from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.gp import GPCreate, GPRead
from app.services import gp_service

router = APIRouter(prefix="/gps", tags=["gps"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[GPRead])
async def list_gps(session: AsyncSession = Depends(get_session)):
    return await gp_service.list_gps(session)


@router.post("", response_model=GPRead, status_code=201)
async def create_gp(payload: GPCreate, session: AsyncSession = Depends(get_session)):
    return await gp_service.create_gp(session, payload)
