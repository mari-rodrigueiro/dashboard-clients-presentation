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

export interface Usuario {
  id: string;
  email: string;
}
