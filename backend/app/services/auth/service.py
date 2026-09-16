import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.errors import ForbiddenError, UnauthorizedError
from app.models.usuario import Usuario
from app.services.auth.security import hash_password, verify_password

logger = logging.getLogger(__name__)
settings = get_settings()


async def seed_admin_user_if_needed(session: AsyncSession) -> None:
    """Cria o usuário único a partir de ADMIN_EMAIL/ADMIN_SEED_PASSWORD, só se a tabela
    Usuario estiver vazia (SPECS.md §15.1). Não faz nada em execuções seguintes."""
    count = (await session.execute(select(func.count()).select_from(Usuario))).scalar_one()
    if count > 0:
        return

    if not settings.ADMIN_EMAIL or not settings.ADMIN_SEED_PASSWORD:
        logger.warning(
            "Nenhum usuário cadastrado e ADMIN_EMAIL/ADMIN_SEED_PASSWORD não definidos "
            "no .env — não será possível fazer login até que um usuário exista."
        )
        return

    usuario = Usuario(
        email=settings.ADMIN_EMAIL,
        password_hash=hash_password(settings.ADMIN_SEED_PASSWORD),
    )
    session.add(usuario)
    await session.commit()
    logger.info("Usuário administrador inicial criado (%s).", settings.ADMIN_EMAIL)


async def authenticate(session: AsyncSession, email: str, password: str) -> Usuario:
    result = await session.execute(select(Usuario).where(Usuario.email == email))
    usuario = result.scalar_one_or_none()
    if usuario is None or not verify_password(password, usuario.password_hash):
        raise UnauthorizedError("E-mail ou senha inválidos")
    return usuario


async def change_password(
    session: AsyncSession, usuario: Usuario, current_password: str, new_password: str
) -> None:
    if not verify_password(current_password, usuario.password_hash):
        raise ForbiddenError("Senha atual incorreta")
    usuario.password_hash = hash_password(new_password)
    await session.commit()
