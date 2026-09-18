import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.acao import Acao
from app.models.cliente import Cliente
from app.models.oportunidade import Oportunidade
from app.schemas.oportunidade import OportunidadeCreate, OportunidadeUpdate


async def _ensure_cliente_exists(session: AsyncSession, cliente_id: uuid.UUID) -> None:
    result = await session.execute(select(Cliente.id).where(Cliente.id == cliente_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("Cliente não encontrado")


async def list_oportunidades(session: AsyncSession, cliente_id: uuid.UUID) -> list[Oportunidade]:
    await _ensure_cliente_exists(session, cliente_id)
    result = await session.execute(
        select(Oportunidade)
        .where(Oportunidade.cliente_id == cliente_id)
        .order_by(Oportunidade.created_at.desc())
    )
    return list(result.scalars().all())


async def get_oportunidade(session: AsyncSession, oportunidade_id: uuid.UUID) -> Oportunidade:
    result = await session.execute(select(Oportunidade).where(Oportunidade.id == oportunidade_id))
    oportunidade = result.scalar_one_or_none()
    if oportunidade is None:
        raise NotFoundError("Oportunidade não encontrada")
    return oportunidade


async def create_oportunidade(
    session: AsyncSession, cliente_id: uuid.UUID, data: OportunidadeCreate
) -> Oportunidade:
    await _ensure_cliente_exists(session, cliente_id)
    oportunidade = Oportunidade(cliente_id=cliente_id, **data.model_dump())
    session.add(oportunidade)
    await session.commit()
    await session.refresh(oportunidade)
    return oportunidade


async def update_oportunidade(
    session: AsyncSession, oportunidade_id: uuid.UUID, data: OportunidadeUpdate
) -> Oportunidade:
    oportunidade = await get_oportunidade(session, oportunidade_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(oportunidade, field, value)
    await session.commit()
    await session.refresh(oportunidade)
    return oportunidade


async def delete_oportunidade(session: AsyncSession, oportunidade_id: uuid.UUID) -> None:
    oportunidade = await get_oportunidade(session, oportunidade_id)
    await session.execute(
        update(Acao).where(Acao.oportunidade_id == oportunidade_id).values(oportunidade_id=None)
    )
    await session.delete(oportunidade)
    await session.commit()
