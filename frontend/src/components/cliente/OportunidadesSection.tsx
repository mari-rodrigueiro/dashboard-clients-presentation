import { type FormEvent, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  useCreateOportunidade,
  useOportunidades,
  useUpdateOportunidadeStatus,
} from "../../hooks/use-oportunidades";
import type { Potencial, StatusOportunidade } from "../../lib/types";

const potencialTone: Record<Potencial, "neutral" | "warning" | "success"> = {
  baixo: "neutral",
  medio: "warning",
  alto: "success",
};

const statusOptions: StatusOportunidade[] = [
  "identificada",
  "em_analise",
  "em_execucao",
  "concretizada",
  "descartada",
];

export function OportunidadesSection({ clienteId }: { clienteId: string }) {
  const { data: oportunidades, isLoading } = useOportunidades(clienteId);
  const createOportunidade = useCreateOportunidade(clienteId);
  const updateStatus = useUpdateOportunidadeStatus(clienteId);

  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [potencial, setPotencial] = useState<Potencial>("medio");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!descricao.trim()) return;
    await createOportunidade.mutateAsync({ descricao, potencial });
    setDescricao("");
    setPotencial("medio");
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Oportunidades</CardTitle>
        <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Nova oportunidade"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-b border-border pb-4">
            <Input
              placeholder="Descrição da oportunidade"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={potencial}
              onChange={(e) => setPotencial(e.target.value as Potencial)}
            >
              <option value="baixo">Baixo</option>
              <option value="medio">Médio</option>
              <option value="alto">Alto</option>
            </select>
            <Button type="submit" disabled={createOportunidade.isPending}>
              {createOportunidade.isPending ? "Salvando..." : "Registrar oportunidade"}
            </Button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : oportunidades && oportunidades.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {oportunidades.map((oportunidade) => (
              <li key={oportunidade.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{oportunidade.descricao}</p>
                  <Badge tone={potencialTone[oportunidade.potencial]}>
                    {oportunidade.potencial}
                  </Badge>
                </div>
                <select
                  className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                  value={oportunidade.status}
                  onChange={(e) =>
                    updateStatus.mutate({
                      id: oportunidade.id,
                      status: e.target.value as StatusOportunidade,
                    })
                  }
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma oportunidade registrada.</p>
        )}
      </CardContent>
    </Card>
  );
}
