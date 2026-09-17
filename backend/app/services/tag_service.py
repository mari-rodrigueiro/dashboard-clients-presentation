import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tag import EntityTag, Tag


async def _get_or_create_tag(session: AsyncSession, nome: str) -> Tag:
    result = await session.execute(select(Tag).where(Tag.nome == nome))
    tag = result.scalar_one_or_none()
    if tag is None:
        tag = Tag(nome=nome)
        session.add(tag)
        await session.flush()
    return tag


async def set_tags(
    session: AsyncSession, entity_type: str, entity_id: uuid.UUID, nomes: list[str]
) -> None:
    """Substitui o conjunto de tags de uma entidade pelo conjunto dado (SPECS.md §4.8)."""
    await session.execute(
        EntityTag.__table__.delete().where(
            EntityTag.entity_type == entity_type, EntityTag.entity_id == entity_id
        )
    )
    for nome in {n.strip() for n in nomes if n.strip()}:
        tag = await _get_or_create_tag(session, nome)
        session.add(EntityTag(entity_type=entity_type, entity_id=entity_id, tag_id=tag.id))


async def get_tags(session: AsyncSession, entity_type: str, entity_id: uuid.UUID) -> list[str]:
    result = await session.execute(
        select(Tag.nome)
        .join(EntityTag, EntityTag.tag_id == Tag.id)
        .where(EntityTag.entity_type == entity_type, EntityTag.entity_id == entity_id)
        .order_by(Tag.nome)
    )
    return list(result.scalars().all())
