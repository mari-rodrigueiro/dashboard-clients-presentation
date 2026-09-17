export type FaseCliente =
  | "onboarding"
  | "adocao"
  | "retencao"
  | "expansao"
  | "recuperacao"
  | "encerrado";

export type HealthStatus = "saudavel" | "atencao" | "critico";

export interface GP {
  id: string;
  nome: string;
  email: string | null;
  created_at: string;
}

export interface Cliente {
  id: string;
  nome: string;
  gp: GP;
  segmento: string | null;
  fase: FaseCliente;
  health_status: HealthStatus;
  contexto: string | null;
  data_entrada: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClienteCreateInput {
  nome: string;
  gp_id: string;
  segmento?: string;
  fase?: FaseCliente;
  health_status?: HealthStatus;
  contexto?: string;
  data_entrada: string;
}

export interface ClienteUpdateInput extends Partial<ClienteCreateInput> {
  ativo?: boolean;
}

export interface ClienteFiltros {
  gp_id?: string;
  fase?: FaseCliente;
  health_status?: HealthStatus;
  q?: string;
}

export interface Usuario {
  id: string;
  email: string;
}

export type StatusPlano = "rascunho" | "ativo" | "em_revisao" | "concluido" | "cancelado";

export interface PlanoSucesso {
  id: string;
  cliente_id: string;
  situacao_inicial: string;
  expectativa_sucesso: string;
  expectativa_curto_prazo: string;
  expectativa_medio_prazo: string;
  expectativa_longo_prazo: string;
  resumo_riscos: string | null;
  resumo_oportunidades: string | null;
  desafios: string | null;
  status: StatusPlano;
  created_at: string;
  updated_at: string;
}

export type PlanoSucessoInput = Omit<
  PlanoSucesso,
  "id" | "cliente_id" | "status" | "created_at" | "updated_at"
>;

export type Severidade = "baixa" | "media" | "alta" | "critica";
export type StatusRisco = "aberto" | "mitigado" | "encerrado";

export interface Risco {
  id: string;
  cliente_id: string;
  descricao: string;
  categoria: string | null;
  severidade: Severidade;
  status: StatusRisco;
  evidencias: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiscoCreateInput {
  descricao: string;
  categoria?: string;
  severidade?: Severidade;
  evidencias?: string;
}

export type Potencial = "baixo" | "medio" | "alto";
export type StatusOportunidade =
  | "identificada"
  | "em_analise"
  | "em_execucao"
  | "concretizada"
  | "descartada";

export interface Oportunidade {
  id: string;
  cliente_id: string;
  descricao: string;
  categoria: string | null;
  potencial: Potencial;
  status: StatusOportunidade;
  evidencias: string | null;
  created_at: string;
  updated_at: string;
}

export interface OportunidadeCreateInput {
  descricao: string;
  categoria?: string;
  potencial?: Potencial;
  evidencias?: string;
}

export type Impacto = "positivo" | "neutro" | "negativo";

export interface Evolucao {
  id: string;
  cliente_id: string;
  data_referencia: string;
  titulo: string;
  contexto: string;
  situacao: string;
  acao_realizada: string;
  resultado: string | null;
  evidencia: string | null;
  responsavel_id: string | null;
  impacto_percebido: Impacto | null;
  impacto_detalhe: string | null;
  observacoes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface EvolucaoCreateInput {
  data_referencia: string;
  titulo: string;
  contexto: string;
  situacao: string;
  acao_realizada: string;
  resultado?: string;
  evidencia?: string;
  impacto_percebido?: Impacto;
  observacoes?: string;
  tags?: string[];
}

export type StatusAcao = "pendente" | "em_andamento" | "concluida" | "atrasada" | "cancelada";

export interface Acao {
  id: string;
  cliente_id: string;
  descricao: string;
  responsavel_id: string | null;
  prazo: string | null;
  status: StatusAcao;
  plano_sucesso_id: string | null;
  risco_id: string | null;
  oportunidade_id: string | null;
  evolucao_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcaoCreateInput {
  descricao: string;
  prazo?: string;
  status?: StatusAcao;
}
