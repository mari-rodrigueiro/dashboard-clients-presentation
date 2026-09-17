import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ChatPanel } from "../../components/ai/ChatPanel";
import { AcoesSection } from "../../components/cliente/AcoesSection";
import { OportunidadesSection } from "../../components/cliente/OportunidadesSection";
import { PlanoSucessoSection } from "../../components/cliente/PlanoSucessoSection";
import { MemoriasSection } from "../../components/cliente/MemoriasSection";
import { RiscosSection } from "../../components/cliente/RiscosSection";
import { Timeline } from "../../components/cliente/Timeline";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { useCliente, useUpdateCliente } from "../../hooks/use-clientes";
import type { FaseCliente, HealthStatus } from "../../lib/types";

const fases: FaseCliente[] = [
  "onboarding",
  "adocao",
  "retencao",
  "expansao",
  "recuperacao",
  "encerrado",
];
const healthStatuses: HealthStatus[] = ["saudavel", "atencao", "critico"];

export function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cliente, isLoading } = useCliente(id);
  const updateCliente = useUpdateCliente(id ?? "");

  const [contexto, setContexto] = useState("");
  const [fase, setFase] = useState<FaseCliente>("onboarding");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("saudavel");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (cliente) {
      setContexto(cliente.contexto ?? "");
      setFase(cliente.fase);
      setHealthStatus(cliente.health_status);
    }
  }, [cliente]);

  if (isLoading || !cliente) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  async function handleSave() {
    await updateCliente.mutateAsync({ contexto, fase, health_status: healthStatus });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{cliente.gp.nome}</p>
          <h1 className="text-2xl font-semibold">{cliente.nome}</h1>
        </div>
        <Link to={`/clientes/${cliente.id}/case`} className="text-sm text-primary hover:underline">
          Ver case →
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Situação atual</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fase">Fase</Label>
              <select
                id="fase"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={fase}
                onChange={(e) => setFase(e.target.value as FaseCliente)}
              >
                {fases.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="health">Saúde</Label>
              <select
                id="health"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as HealthStatus)}
              >
                {healthStatuses.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contexto">Contexto</Label>
            <textarea
              id="contexto"
              className="min-h-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              placeholder="Resumo executivo do cliente..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={updateCliente.isPending}>
              {updateCliente.isPending ? "Salvando..." : "Salvar"}
            </Button>
            {saved && <span className="text-sm text-emerald-700">Salvo.</span>}
          </div>
        </CardContent>
      </Card>

      <ChatPanel clienteId={cliente.id} />
      <MemoriasSection clienteId={cliente.id} />
      <PlanoSucessoSection clienteId={cliente.id} />
      <Timeline clienteId={cliente.id} />
      <RiscosSection clienteId={cliente.id} />
      <OportunidadesSection clienteId={cliente.id} />
      <AcoesSection clienteId={cliente.id} />
    </div>
  );
}
