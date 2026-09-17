import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.cliente import Cliente
from app.models.memoria import Memoria
from app.schemas.memoria import MemoriaCreate


async def list_memorias(session: AsyncSession, cliente_id: uuid.UUID) -> list[Memoria]:
    result = await session.execute(select(Cliente.id).where(Cliente.id == cliente_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("Cliente não encontrado")

    result = await session.execute(
        select(Memoria).where(Memoria.cliente_id == cliente_id).order_by(Memoria.created_at.desc())
    )
    return list(result.scalars().all())


async def create_memoria(session: AsyncSession, data: MemoriaCreate, criado_por: str) -> Memoria:
    memoria = Memoria(**data.model_dump(), criado_por=criado_por)
    session.add(memoria)
    await session.commit()
    await session.refresh(memoria)
    return memoria
