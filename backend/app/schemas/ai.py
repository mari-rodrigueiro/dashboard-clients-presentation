import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.ai_conversation import Papel


class ReferenciaUtilizada(BaseModel):
    source_type: str
    source_id: str
    titulo: str


class ChatRequest(BaseModel):
    session_id: uuid.UUID | None = None
    cliente_id: uuid.UUID | None = None
    mensagem: str = Field(min_length=1)


class ChatResponse(BaseModel):
    session_id: uuid.UUID
    mensagem: str
    referencias_utilizadas: list[ReferenciaUtilizada]


class AiMessageRead(BaseModel):
    id: uuid.UUID
    papel: Papel
    conteudo: str
    referencias_utilizadas: list[ReferenciaUtilizada] | None
    created_at: datetime


class AiSessionRead(BaseModel):
    id: uuid.UUID
    cliente_id: uuid.UUID | None
    usuario: str
    mensagens: list[AiMessageRead]
    created_at: datetime
