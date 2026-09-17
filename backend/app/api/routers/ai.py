import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_llm_provider, get_session
from app.core.errors import NotFoundError
from app.models.ai_conversation import AiMessage, AiSession
from app.models.usuario import Usuario
from app.schemas.ai import AiMessageRead, AiSessionRead, ChatRequest, ChatResponse
from app.services.ai import chat_service
from app.services.ai.llm_client import LLMProvider

router = APIRouter(prefix="/ai", tags=["ai"], dependencies=[Depends(get_current_user)])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    usuario: Usuario = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
    llm: LLMProvider = Depends(get_llm_provider),
):
    return await chat_service.send_message(
        session,
        llm,
        session_id=payload.session_id,
        cliente_id=payload.cliente_id,
        mensagem=payload.mensagem,
        usuario=usuario.email,
    )


@router.get("/sessions/{session_id}", response_model=AiSessionRead)
async def get_ai_session(session_id: uuid.UUID, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(AiSession).where(AiSession.id == session_id))
    ai_session = result.scalar_one_or_none()
    if ai_session is None:
        raise NotFoundError("Sessão de IA não encontrada")

    messages_result = await session.execute(
        select(AiMessage).where(AiMessage.session_id == session_id).order_by(AiMessage.created_at)
    )
    return AiSessionRead(
        id=ai_session.id,
        cliente_id=ai_session.cliente_id,
        usuario=ai_session.usuario,
        created_at=ai_session.created_at,
        mensagens=[
            AiMessageRead.model_validate(m, from_attributes=True)
            for m in messages_result.scalars().all()
        ],
    )
