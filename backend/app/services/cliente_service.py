import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import NotFoundError
from app.models.cliente import Cliente, FaseCliente, HealthStatus
from app.models.gp import GP
from app.schemas.cliente import ClienteCreate, ClienteUpdate


async def list_clientes(
    session: AsyncSession,
    gp_id: uuid.UUID | None = None,
    fase: FaseCliente | None = None,
    health_status: HealthStatus | None = None,
    q: str | None = None,
) -> list[Cliente]:
    stmt = select(Cliente).options(selectinload(Cliente.gp)).order_by(Cliente.nome)
    if gp_id is not None:
        stmt = stmt.where(Cliente.gp_id == gp_id)
    if fase is not None:
        stmt = stmt.where(Cliente.fase == fase)
    if health_status is not None:
        stmt = stmt.where(Cliente.health_status == health_status)
    if q:
        stmt = stmt.where(Cliente.nome.ilike(f"%{q}%"))
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_cliente(session: AsyncSession, cliente_id: uuid.UUID) -> Cliente:
    result = await session.execute(
        select(Cliente).options(selectinload(Cliente.gp)).where(Cliente.id == cliente_id)
    )
    cliente = result.scalar_one_or_none()
    if cliente is None:
        raise NotFoundError("Cliente não encontrado")
    return cliente


async def _ensure_gp_exists(session: AsyncSession, gp_id: uuid.UUID) -> None:
    result = await session.execute(select(GP.id).where(GP.id == gp_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundError("GP não encontrado")


async def create_cliente(session: AsyncSession, data: ClienteCreate) -> Cliente:
    await _ensure_gp_exists(session, data.gp_id)
    cliente = Cliente(**data.model_dump())
    session.add(cliente)
    await session.commit()
    return await get_cliente(session, cliente.id)


async def update_cliente(
    session: AsyncSession, cliente_id: uuid.UUID, data: ClienteUpdate
) -> Cliente:
    cliente = await get_cliente(session, cliente_id)
    updates = data.model_dump(exclude_unset=True)
    if "gp_id" in updates:
        await _ensure_gp_exists(session, updates["gp_id"])
    for field, value in updates.items():
        setattr(cliente, field, value)
    await session.commit()
    return await get_cliente(session, cliente_id)
