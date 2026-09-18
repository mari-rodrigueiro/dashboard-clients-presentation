import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ImportarClientePanel } from "../../components/cliente/ImportarClientePanel";
import { useCreateCliente, useClientes } from "../../hooks/use-clientes";
import { useCreateGP, useGPs } from "../../hooks/use-gps";
import type { FaseCliente, HealthStatus } from "../../lib/types";

const healthTone: Record<HealthStatus, "success" | "warning" | "danger"> = {
  saudavel: "success",
  atencao: "warning",
  critico: "danger",
};

const healthLabel: Record<HealthStatus, string> = {
  saudavel: "Saudável",
  atencao: "Atenção",
  critico: "Crítico",
};

const fases: FaseCliente[] = [
  "onboarding",
  "adocao",
  "retencao",
  "expansao",
  "recuperacao",
  "encerrado",
];
const healthStatuses: HealthStatus[] = ["saudavel", "atencao", "critico"];

export function ClientesListPage() {
  const [busca, setBusca] = useState("");
  const [filtroGpId, setFiltroGpId] = useState("");
  const [filtroFase, setFiltroFase] = useState<FaseCliente | "">("");
  const [filtroHealth, setFiltroHealth] = useState<HealthStatus | "">("");

  const { data: clientes, isLoading } = useClientes({
    q: busca || undefined,
    gp_id: filtroGpId || undefined,
    fase: filtroFase || undefined,
    health_status: filtroHealth || undefined,
  });
  const { data: gps } = useGPs();
  const createCliente = useCreateCliente();
  const createGP = useCreateGP();

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [gpId, setGpId] = useState("");
  const [dataEntrada, setDataEntrada] = useState(() => new Date().toISOString().slice(0, 10));
  const [novoGpNome, setNovoGpNome] = useState("");
  const [error, setError] = useState<string | null>(null);

  const gpOptions = useMemo(() => gps ?? [], [gps]);

  async function handleCreateGp() {
    if (!novoGpNome.trim()) return;
    const gp = await createGP.mutateAsync(novoGpNome.trim());
    setGpId(gp.id);
    setNovoGpNome("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!gpId) {
      setError("Selecione ou cadastre um GP.");
      return;
    }
    try {
      await createCliente.mutateAsync({ nome, gp_id: gpId, data_entrada: dataEntrada });
      setNome("");
      setGpId("");
      setShowForm(false);
    } catch {
      setError("Não foi possível criar o cliente.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Novo cliente"}
        </Button>
      </div>

      <ImportarClientePanel />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  <option value="">Selecione...</option>
                  {gpOptions.map((gp) => (
                    <option key={gp.id} value={gp.id}>
                      {gp.nome}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Cadastrar novo GP"
                    value={novoGpNome}
                    onChange={(e) => setNovoGpNome(e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={handleCreateGp}>
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="data_entrada">Data de entrada no acompanhamento</Label>
                <Input
                  id="data_entrada"
                  type="date"
                  value={dataEntrada}
                  onChange={(e) => setDataEntrada(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={createCliente.isPending}>
                {createCliente.isPending ? "Salvando..." : "Salvar cliente"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-wrap gap-3 py-4">
          <Input
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="max-w-xs"
          />
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={filtroGpId}
            onChange={(e) => setFiltroGpId(e.target.value)}
          >
            <option value="">Todos os GPs</option>
            {gpOptions.map((gp) => (
              <option key={gp.id} value={gp.id}>
                {gp.nome}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={filtroFase}
            onChange={(e) => setFiltroFase(e.target.value as FaseCliente | "")}
          >
            <option value="">Todas as fases</option>
            {fases.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            value={filtroHealth}
            onChange={(e) => setFiltroHealth(e.target.value as HealthStatus | "")}
          >
            <option value="">Toda saúde</option>
            {healthStatuses.map((h) => (
              <option key={h} value={h}>
                {healthLabel[h]}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : clientes && clientes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Link key={cliente.id} to={`/clientes/${cliente.id}`}>
              <Card className="flex h-full flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold leading-tight">{cliente.nome}</p>
                    <p className="text-xs text-muted-foreground">{cliente.gp.nome}</p>
                  </div>
                  <Badge tone={healthTone[cliente.health_status]}>
                    {healthLabel[cliente.health_status]}
                  </Badge>
                </div>
                {cliente.contexto && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{cliente.contexto}</p>
                )}
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{cliente.fase.replace("_", " ")}</span>
                  <span>Desde {new Date(cliente.data_entrada).toLocaleDateString("pt-BR")}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-sm text-muted-foreground">
          {busca || filtroGpId || filtroFase || filtroHealth
            ? "Nenhum cliente encontrado com esses filtros."
            : 'Nenhum cliente cadastrado ainda. Clique em "Novo cliente" para começar.'}
        </Card>
      )}
    </div>
  );
}
