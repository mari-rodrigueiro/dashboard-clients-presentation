import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.acao import Acao
from app.models.cliente import Cliente
from app.schemas.acao import AcaoCreate, AcaoUpdate


async def _ensure_cliente_exists(session: AsyncSession, cliente_id: uuid.UUID) -> None:
    result = await session.execute(select(Cliente.id).where(Cliente.id == cliente_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("Cliente não encontrado")


async def list_acoes(session: AsyncSession, cliente_id: uuid.UUID) -> list[Acao]:
    await _ensure_cliente_exists(session, cliente_id)
    result = await session.execute(
        select(Acao).where(Acao.cliente_id == cliente_id).order_by(Acao.created_at.desc())
    )
    return list(result.scalars().all())


async def get_acao(session: AsyncSession, acao_id: uuid.UUID) -> Acao:
    result = await session.execute(select(Acao).where(Acao.id == acao_id))
    acao = result.scalar_one_or_none()
    if acao is None:
        raise NotFoundError("Ação não encontrada")
    return acao


async def create_acao(session: AsyncSession, cliente_id: uuid.UUID, data: AcaoCreate) -> Acao:
    await _ensure_cliente_exists(session, cliente_id)
    acao = Acao(cliente_id=cliente_id, **data.model_dump())
    session.add(acao)
    await session.commit()
    await session.refresh(acao)
    return acao


async def update_acao(session: AsyncSession, acao_id: uuid.UUID, data: AcaoUpdate) -> Acao:
    acao = await get_acao(session, acao_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(acao, field, value)
    await session.commit()
    await session.refresh(acao)
    return acao


async def delete_acao(session: AsyncSession, acao_id: uuid.UUID) -> None:
    acao = await get_acao(session, acao_id)
    await session.delete(acao)
    await session.commit()
