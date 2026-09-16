from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gp import GP
from app.schemas.gp import GPCreate


async def list_gps(session: AsyncSession) -> list[GP]:
    result = await session.execute(select(GP).order_by(GP.nome))
    return list(result.scalars().all())


async def create_gp(session: AsyncSession, data: GPCreate) -> GP:
    gp = GP(nome=data.nome, email=data.email)
    session.add(gp)
    await session.commit()
    await session.refresh(gp)
    return gp
