import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.plano_sucesso import StatusPlano


class PlanoSucessoUpsert(BaseModel):
    situacao_inicial: str
    expectativa_sucesso: str
    expectativa_curto_prazo: str
    expectativa_medio_prazo: str
    expectativa_longo_prazo: str
    resumo_riscos: str | None = None
    resumo_oportunidades: str | None = None
    desafios: str | None = None


class PlanoSucessoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cliente_id: uuid.UUID
    situacao_inicial: str
    expectativa_sucesso: str
    expectativa_curto_prazo: str
    expectativa_medio_prazo: str
    expectativa_longo_prazo: str
    resumo_riscos: str | None
    resumo_oportunidades: str | None
    desafios: str | None
    status: StatusPlano
    created_at: datetime
    updated_at: datetime
