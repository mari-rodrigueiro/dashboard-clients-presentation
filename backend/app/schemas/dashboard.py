import uuid
from datetime import date

from pydantic import BaseModel

from app.models.cliente import FaseCliente, HealthStatus
from app.models.evolucao import Impacto


class ContagemFase(BaseModel):
    fase: FaseCliente
    total: int


class ContagemSaude(BaseModel):
    health_status: HealthStatus
    total: int


class ContagemGP(BaseModel):
    gp_nome: str
    total: int


class EvolucaoResumo(BaseModel):
    id: uuid.UUID
    cliente_id: uuid.UUID
    cliente_nome: str
    titulo: str
    data_referencia: date
    resultado: str | None
    impacto_percebido: Impacto | None


class DashboardStats(BaseModel):
    total_clientes: int
    clientes_por_fase: list[ContagemFase]
    clientes_por_saude: list[ContagemSaude]
    clientes_por_gp: list[ContagemGP]
    oportunidades_ativas: int
    ultimas_evolucoes: list[EvolucaoResumo]
    cases_destaque: list[EvolucaoResumo]
