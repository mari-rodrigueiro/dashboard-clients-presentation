import { type FormEvent, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useAcoes, useCreateAcao, useUpdateAcaoStatus } from "../../hooks/use-acoes";
import type { StatusAcao } from "../../lib/types";

const statusTone: Record<StatusAcao, "neutral" | "warning" | "success" | "danger"> = {
  pendente: "neutral",
  em_andamento: "warning",
  concluida: "success",
  atrasada: "danger",
  cancelada: "neutral",
};

const statusOptions: StatusAcao[] = [
  "pendente",
  "em_andamento",
  "concluida",
  "atrasada",
  "cancelada",
];

export function AcoesSection({ clienteId }: { clienteId: string }) {
  const { data: acoes, isLoading } = useAcoes(clienteId);
  const createAcao = useCreateAcao(clienteId);
  const updateStatus = useUpdateAcaoStatus(clienteId);

  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!descricao.trim()) return;
    await createAcao.mutateAsync({ descricao, prazo: prazo || undefined });
    setDescricao("");
    setPrazo("");
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ações</CardTitle>
        <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Nova ação"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-b border-border pb-4">
            <Input
              placeholder="Descrição da ação"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
            <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
            <Button type="submit" disabled={createAcao.isPending}>
              {createAcao.isPending ? "Salvando..." : "Registrar ação"}
            </Button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : acoes && acoes.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {acoes.map((acao) => (
              <li key={acao.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm">{acao.descricao}</p>
                  <div className="flex items-center gap-2">
                    {acao.prazo && (
                      <span className="text-xs text-muted-foreground">Prazo: {acao.prazo}</span>
                    )}
                    <Badge tone={statusTone[acao.status]}>{acao.status}</Badge>
                  </div>
                </div>
                <select
                  className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                  value={acao.status}
                  onChange={(e) =>
                    updateStatus.mutate({ id: acao.id, status: e.target.value as StatusAcao })
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
          <p className="text-sm text-muted-foreground">Nenhuma ação registrada.</p>
        )}
      </CardContent>
    </Card>
  );
}
