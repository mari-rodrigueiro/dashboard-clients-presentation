from collections.abc import AsyncGenerator

from fastapi import Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import UnauthorizedError
from app.db.session import get_db
from app.models.usuario import Usuario
from app.services.ai.llm_client import LLMProvider, OpenAILLMProvider
from app.services.auth.security import COOKIE_NAME, decode_access_token


async def get_session(db: AsyncSession = Depends(get_db)) -> AsyncGenerator[AsyncSession, None]:
    yield db


def get_llm_provider() -> LLMProvider:
    return OpenAILLMProvider()


async def get_current_user(
    request: Request, session: AsyncSession = Depends(get_session)
) -> Usuario:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise UnauthorizedError("Sessão não encontrada")

    user_id = decode_access_token(token)
    if user_id is None:
        raise UnauthorizedError("Sessão inválida ou expirada")

    result = await session.execute(select(Usuario).where(Usuario.id == user_id))
    usuario = result.scalar_one_or_none()
    if usuario is None:
        raise UnauthorizedError("Sessão inválida ou expirada")
    return usuario
