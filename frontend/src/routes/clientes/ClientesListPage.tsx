import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useCreateCliente, useClientes } from "../../hooks/use-clientes";
import { useCreateGP, useGPs } from "../../hooks/use-gps";
import type { HealthStatus } from "../../lib/types";

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

export function ClientesListPage() {
  const { data: clientes, isLoading } = useClientes();
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
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">Carregando...</p>
          ) : clientes && clientes.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">GP</th>
                  <th className="px-6 py-3 font-medium">Fase</th>
                  <th className="px-6 py-3 font-medium">Saúde</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-3">
                      <Link to={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                        {cliente.nome}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{cliente.gp.nome}</td>
                    <td className="px-6 py-3 text-muted-foreground">{cliente.fase}</td>
                    <td className="px-6 py-3">
                      <Badge tone={healthTone[cliente.health_status]}>
                        {healthLabel[cliente.health_status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              Nenhum cliente cadastrado ainda. Clique em &quot;Novo cliente&quot; para começar.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
