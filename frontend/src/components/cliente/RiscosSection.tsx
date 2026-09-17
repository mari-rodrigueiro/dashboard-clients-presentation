import { type FormEvent, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useCreateRisco, useRiscos, useUpdateRiscoStatus } from "../../hooks/use-riscos";
import type { Severidade, StatusRisco } from "../../lib/types";

const severidadeTone: Record<Severidade, "neutral" | "warning" | "danger"> = {
  baixa: "neutral",
  media: "warning",
  alta: "warning",
  critica: "danger",
};

const statusOptions: StatusRisco[] = ["aberto", "mitigado", "encerrado"];

export function RiscosSection({ clienteId }: { clienteId: string }) {
  const { data: riscos, isLoading } = useRiscos(clienteId);
  const createRisco = useCreateRisco(clienteId);
  const updateStatus = useUpdateRiscoStatus(clienteId);

  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [severidade, setSeveridade] = useState<Severidade>("media");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!descricao.trim()) return;
    await createRisco.mutateAsync({ descricao, severidade });
    setDescricao("");
    setSeveridade("media");
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Riscos</CardTitle>
        <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Novo risco"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-b border-border pb-4">
            <Input
              placeholder="Descrição do risco"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
            <select
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
              value={severidade}
              onChange={(e) => setSeveridade(e.target.value as Severidade)}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
            <Button type="submit" disabled={createRisco.isPending}>
              {createRisco.isPending ? "Salvando..." : "Registrar risco"}
            </Button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : riscos && riscos.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {riscos.map((risco) => (
              <li key={risco.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{risco.descricao}</p>
                  <Badge tone={severidadeTone[risco.severidade]}>{risco.severidade}</Badge>
                </div>
                <select
                  className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                  value={risco.status}
                  onChange={(e) =>
                    updateStatus.mutate({ id: risco.id, status: e.target.value as StatusRisco })
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
          <p className="text-sm text-muted-foreground">Nenhum risco registrado.</p>
        )}
      </CardContent>
    </Card>
  );
}
