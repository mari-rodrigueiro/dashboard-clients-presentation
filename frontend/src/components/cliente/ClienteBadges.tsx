import type { FaseCliente, HealthStatus } from "../../lib/types";
import { Badge } from "../ui/badge";

export const healthLabel: Record<HealthStatus, string> = {
  saudavel: "Saudável",
  atencao: "Atenção",
  critico: "Crítico",
};

export const healthTone: Record<HealthStatus, "success" | "warning" | "danger"> = {
  saudavel: "success",
  atencao: "warning",
  critico: "danger",
};

export function HealthBadge({ health }: { health: HealthStatus }) {
  return (
    <Badge tone={healthTone[health]} dot>
      {healthLabel[health]}
    </Badge>
  );
}

export const faseLabel: Record<FaseCliente, string> = {
  onboarding: "Onboarding",
  adocao: "Adoção",
  retencao: "Retenção",
  expansao: "Expansão",
  recuperacao: "Recuperação",
  encerrado: "Encerrado",
};

export function PhaseTag({ fase }: { fase: FaseCliente }) {
  return (
    <span className="rounded-sm bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-secondary-foreground">
      {faseLabel[fase]}
    </span>
  );
}

export function EmptyState({
  title = "Nenhum registro encontrado",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="glass-panel col-span-full rounded-lg px-6 py-16 text-center">
      <p className="font-display text-base font-bold">{title}</p>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
