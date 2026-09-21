import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { ChatPanel } from "../../components/ai/ChatPanel";
import { AcoesSection } from "../../components/cliente/AcoesSection";
import {
  faseLabel,
  healthLabel,
  HealthBadge,
  PhaseTag,
} from "../../components/cliente/ClienteBadges";
import { OportunidadesSection } from "../../components/cliente/OportunidadesSection";
import { PlanoSucessoSection } from "../../components/cliente/PlanoSucessoSection";
import { MemoriasSection } from "../../components/cliente/MemoriasSection";
import { RiscosSection } from "../../components/cliente/RiscosSection";
import { Timeline } from "../../components/cliente/Timeline";
import { PageIntro } from "../../components/layout/PageHeader";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useCliente, useUpdateCliente } from "../../hooks/use-clientes";
import { useGPs } from "../../hooks/use-gps";
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
  const navigate = useNavigate();
  const { data: cliente, isLoading } = useCliente(id);
  const { data: gps } = useGPs();
  const updateCliente = useUpdateCliente(id ?? "");

  const [nome, setNome] = useState("");
  const [gpId, setGpId] = useState("");
  const [segmento, setSegmento] = useState("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [contexto, setContexto] = useState("");
  const [fase, setFase] = useState<FaseCliente>("onboarding");
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("saudavel");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome);
      setGpId(cliente.gp.id);
      setSegmento(cliente.segmento ?? "");
      setDataEntrada(cliente.data_entrada);
      setContexto(cliente.contexto ?? "");
      setFase(cliente.fase);
      setHealthStatus(cliente.health_status);
    }
  }, [cliente]);

  if (isLoading || !cliente) {
    return <p className="text-sm text-muted-foreground">Carregando...</p>;
  }

  async function handleSave() {
    await updateCliente.mutateAsync({
      nome,
      gp_id: gpId,
      segmento: segmento || undefined,
      data_entrada: dataEntrada,
      contexto,
      fase,
      health_status: healthStatus,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleToggleAtivo() {
    if (!cliente) return;
    const estaAtivo = cliente.ativo;
    if (estaAtivo) {
      const confirmado = window.confirm(
        `Desativar "${cliente.nome}"? O cliente sai das listagens ativas, mas nada é apagado — pode ser reativado depois.`,
      );
      if (!confirmado) return;
    }
    await updateCliente.mutateAsync({ ativo: !estaAtivo });
    if (estaAtivo) {
      navigate("/clientes");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/clientes"
          className="mb-3 -ml-3 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar para clientes
        </Link>
        <PageIntro
          eyebrow={`${cliente.gp.nome}${cliente.segmento ? ` · ${cliente.segmento}` : ""}`}
          title={cliente.nome}
          description={cliente.contexto ?? undefined}
          action={
            <div className="flex items-center gap-2">
              <PhaseTag fase={cliente.fase} />
              <HealthBadge health={cliente.health_status} />
              {!cliente.ativo && <Badge tone="neutral">Inativo</Badge>}
              <Link
                to={`/clientes/${cliente.id}/case`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Ver case →
              </Link>
            </div>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="gp">GP responsável</Label>
              <select
                id="gp"
                className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                value={gpId}
                onChange={(e) => setGpId(e.target.value)}
              >
                {(gps ?? []).map((gp) => (
                  <option key={gp.id} value={gp.id}>
                    {gp.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="segmento">Segmento</Label>
              <Input
                id="segmento"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                placeholder="Ex.: Indústria, Varejo..."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="data_entrada">Data de entrada</Label>
              <Input
                id="data_entrada"
                type="date"
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
                required
              />
            </div>
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
                    {faseLabel[f]}
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
                    {healthLabel[h]}
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
            {saved && <span className="text-sm text-success">Salvo.</span>}
            <Button
              type="button"
              variant={cliente.ativo ? "destructive" : "outline"}
              className="ml-auto"
              onClick={handleToggleAtivo}
              disabled={updateCliente.isPending}
            >
              {cliente.ativo ? "Desativar cliente" : "Reativar cliente"}
            </Button>
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
