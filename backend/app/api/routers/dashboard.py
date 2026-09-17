from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_session
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service

router = APIRouter(tags=["dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(session: AsyncSession = Depends(get_session)):
    return await dashboard_service.get_dashboard_stats(session)
