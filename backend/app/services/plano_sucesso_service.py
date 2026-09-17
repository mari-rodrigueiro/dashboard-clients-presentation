import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import NotFoundError
from app.models.cliente import Cliente
from app.models.plano_sucesso import PlanoSucesso, StatusPlano
from app.schemas.plano_sucesso import PlanoSucessoUpsert


async def _ensure_cliente_exists(session: AsyncSession, cliente_id: uuid.UUID) -> None:
    result = await session.execute(select(Cliente.id).where(Cliente.id == cliente_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("Cliente não encontrado")


async def get_active_plano(session: AsyncSession, cliente_id: uuid.UUID) -> PlanoSucesso | None:
    await _ensure_cliente_exists(session, cliente_id)
    result = await session.execute(
        select(PlanoSucesso).where(
            PlanoSucesso.cliente_id == cliente_id, PlanoSucesso.status == StatusPlano.ATIVO
        )
    )
    return result.scalar_one_or_none()


async def upsert_plano(
    session: AsyncSession, cliente_id: uuid.UUID, data: PlanoSucessoUpsert
) -> PlanoSucesso:
    """Só existe um plano `ativo` por cliente (SPECS.md §4.3, regra de aplicação): atualiza
    o plano ativo existente, ou cria um novo se ainda não houver nenhum."""
    plano = await get_active_plano(session, cliente_id)
    if plano is None:
        plano = PlanoSucesso(cliente_id=cliente_id, status=StatusPlano.ATIVO, **data.model_dump())
        session.add(plano)
    else:
        for field, value in data.model_dump().items():
            setattr(plano, field, value)
    await session.commit()
    await session.refresh(plano)
    return plano
