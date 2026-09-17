import re
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_conversation import AiMessage, AiSession, Papel
from app.schemas.ai import ChatResponse, ReferenciaUtilizada
from app.services.ai import context_builder, prompt
from app.services.ai.llm_client import LLMProvider

HISTORICO_LIMITE = 10  # SPECS.md §12.1 — padrão N=10 últimas mensagens da sessão


async def _get_or_create_session(
    session: AsyncSession, session_id: uuid.UUID | None, cliente_id: uuid.UUID | None, usuario: str
) -> AiSession:
    if session_id is not None:
        result = await session.execute(select(AiSession).where(AiSession.id == session_id))
        ai_session = result.scalar_one_or_none()
        if ai_session is not None:
            return ai_session
    ai_session = AiSession(cliente_id=cliente_id, usuario=usuario)
    session.add(ai_session)
    await session.flush()
    return ai_session


async def _historico(session: AsyncSession, ai_session_id: uuid.UUID) -> list[AiMessage]:
    result = await session.execute(
        select(AiMessage)
        .where(AiMessage.session_id == ai_session_id)
        .order_by(AiMessage.created_at.desc())
        .limit(HISTORICO_LIMITE)
    )
    return list(reversed(result.scalars().all()))


def _extrair_referencias(
    resposta: str, context_items: list[context_builder.ContextItem]
) -> list[ReferenciaUtilizada]:
    indices_citados = {int(n) for n in re.findall(r"\[(\d+)\]", resposta)}
    referencias = []
    for i, item in enumerate(context_items, start=1):
        if i in indices_citados:
            referencias.append(
                ReferenciaUtilizada(
                    source_type=item.source_type, source_id=str(item.source_id), titulo=item.titulo
                )
            )
    return referencias


async def send_message(
    session: AsyncSession,
    llm: LLMProvider,
    *,
    session_id: uuid.UUID | None,
    cliente_id: uuid.UUID | None,
    mensagem: str,
    usuario: str,
) -> ChatResponse:
    ai_session = await _get_or_create_session(session, session_id, cliente_id, usuario)
    historico = await _historico(session, ai_session.id)
    # Pergunta de acompanhamento na mesma sessão herda o cliente da sessão mesmo se o
    # request não reenviar cliente_id (ex.: "e qual a fase dele agora?").
    cliente_escopo = cliente_id if cliente_id is not None else ai_session.cliente_id
    context_items = await context_builder.build_context(session, cliente_escopo, mensagem)
    messages = prompt.build_messages(context_items, historico, mensagem)

    resposta_texto = await llm.complete(messages)
    referencias = _extrair_referencias(resposta_texto, context_items)

    session.add(AiMessage(session_id=ai_session.id, papel=Papel.USER, conteudo=mensagem))
    session.add(
        AiMessage(
            session_id=ai_session.id,
            papel=Papel.ASSISTANT,
            conteudo=resposta_texto,
            referencias_utilizadas=[r.model_dump() for r in referencias],
        )
    )
    await session.commit()

    return ChatResponse(
        session_id=ai_session.id, mensagem=resposta_texto, referencias_utilizadas=referencias
    )
