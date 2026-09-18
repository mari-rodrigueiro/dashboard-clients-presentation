import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.acao import Acao
from app.models.cliente import Cliente
from app.models.risco import Risco
from app.schemas.risco import RiscoCreate, RiscoUpdate


async def _ensure_cliente_exists(session: AsyncSession, cliente_id: uuid.UUID) -> None:
    result = await session.execute(select(Cliente.id).where(Cliente.id == cliente_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("Cliente não encontrado")


async def list_riscos(session: AsyncSession, cliente_id: uuid.UUID) -> list[Risco]:
    await _ensure_cliente_exists(session, cliente_id)
    result = await session.execute(
        select(Risco).where(Risco.cliente_id == cliente_id).order_by(Risco.created_at.desc())
    )
    return list(result.scalars().all())


async def get_risco(session: AsyncSession, risco_id: uuid.UUID) -> Risco:
    result = await session.execute(select(Risco).where(Risco.id == risco_id))
    risco = result.scalar_one_or_none()
    if risco is None:
        raise NotFoundError("Risco não encontrado")
    return risco


async def create_risco(session: AsyncSession, cliente_id: uuid.UUID, data: RiscoCreate) -> Risco:
    await _ensure_cliente_exists(session, cliente_id)
    risco = Risco(cliente_id=cliente_id, **data.model_dump())
    session.add(risco)
    await session.commit()
    await session.refresh(risco)
    return risco


async def update_risco(session: AsyncSession, risco_id: uuid.UUID, data: RiscoUpdate) -> Risco:
    risco = await get_risco(session, risco_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(risco, field, value)
    await session.commit()
    await session.refresh(risco)
    return risco


async def delete_risco(session: AsyncSession, risco_id: uuid.UUID) -> None:
    risco = await get_risco(session, risco_id)
    # SQLite não força FK por padrão nesta stack — sem isso, ações que apontam para este
    # risco ficariam com `risco_id` órfão em vez de simplesmente perder o vínculo.
    await session.execute(update(Acao).where(Acao.risco_id == risco_id).values(risco_id=None))
    await session.delete(risco)
    await session.commit()
