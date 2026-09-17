import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.memoria import TipoMemoria


class MemoriaCreate(BaseModel):
    cliente_id: uuid.UUID | None = None
    origem_sessao_id: uuid.UUID | None = None
    titulo: str = Field(min_length=1, max_length=255)
    conteudo: str = Field(min_length=1)
    tipo: TipoMemoria = TipoMemoria.INSIGHT


class MemoriaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cliente_id: uuid.UUID | None
    origem_sessao_id: uuid.UUID | None
    titulo: str
    conteudo: str
    tipo: TipoMemoria
    criado_por: str
    created_at: datetime
