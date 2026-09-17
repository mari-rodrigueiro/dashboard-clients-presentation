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


async def get_tags_for_many(
    session: AsyncSession, entity_type: str, entity_ids: list[uuid.UUID]
) -> dict[uuid.UUID, list[str]]:
    """Busca as tags de várias entidades em uma única query — evita N+1 em listagens
    (ex.: `evolucao_service.list_evolucoes`)."""
    if not entity_ids:
        return {}
    result = await session.execute(
        select(EntityTag.entity_id, Tag.nome)
        .join(Tag, EntityTag.tag_id == Tag.id)
        .where(EntityTag.entity_type == entity_type, EntityTag.entity_id.in_(entity_ids))
        .order_by(Tag.nome)
    )
    tags_by_entity: dict[uuid.UUID, list[str]] = {entity_id: [] for entity_id in entity_ids}
    for entity_id, nome in result.all():
        tags_by_entity[entity_id].append(nome)
    return tags_by_entity
