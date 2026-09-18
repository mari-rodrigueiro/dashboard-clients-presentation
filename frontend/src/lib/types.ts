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

export interface RiscoImportado {
  descricao: string;
  severidade: Severidade;
  evidencias: string | null;
}

export interface ClienteImportPreview {
  nome: string;
  gp_nome_sugerido: string | null;
  gp_id_sugerido: string | null;
  fase_sugerida: FaseCliente;
  health_status_sugerido: HealthStatus;
  contexto: string;
  data_entrada: string;
  plano_sucesso: PlanoSucessoInput;
  riscos: RiscoImportado[];
  avisos: string[];
}

export interface ClienteImportConfirmInput {
  nome: string;
  gp_id: string;
  fase: FaseCliente;
  health_status?: HealthStatus;
  contexto: string;
  data_entrada: string;
  plano_sucesso: PlanoSucessoInput;
  riscos: RiscoImportado[];
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

export interface ContagemFase {
  fase: FaseCliente;
  total: number;
}

export interface ContagemSaude {
  health_status: HealthStatus;
  total: number;
}

export interface ContagemGP {
  gp_nome: string;
  total: number;
}

export interface EvolucaoResumo {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  titulo: string;
  data_referencia: string;
  resultado: string | null;
  impacto_percebido: Impacto | null;
}

export type TipoMemoria = "insight" | "padrao" | "aprendizado";

export interface Memoria {
  id: string;
  cliente_id: string | null;
  origem_sessao_id: string | null;
  titulo: string;
  conteudo: string;
  tipo: TipoMemoria;
  criado_por: string;
  created_at: string;
}

export interface MemoriaCreateInput {
  cliente_id?: string;
  origem_sessao_id?: string;
  titulo: string;
  conteudo: string;
  tipo?: TipoMemoria;
}

export interface ReferenciaUtilizada {
  source_type: string;
  source_id: string;
  titulo: string;
}

export interface ChatRequest {
  session_id?: string;
  cliente_id?: string;
  mensagem: string;
}

export interface ChatResponse {
  session_id: string;
  mensagem: string;
  referencias_utilizadas: ReferenciaUtilizada[];
}

export interface DashboardStats {
  total_clientes: number;
  clientes_por_fase: ContagemFase[];
  clientes_por_saude: ContagemSaude[];
  clientes_por_gp: ContagemGP[];
  clientes_em_risco: number;
  oportunidades_ativas: number;
  ultimas_evolucoes: EvolucaoResumo[];
  cases_destaque: EvolucaoResumo[];
}
