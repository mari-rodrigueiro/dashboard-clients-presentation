import { type FormEvent, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  useCreateRisco,
  useDeleteRisco,
  useRiscos,
  useUpdateRisco,
  useUpdateRiscoStatus,
} from "../../hooks/use-riscos";
import type { Risco, Severidade, StatusRisco } from "../../lib/types";

const severidadeTone: Record<Severidade, "neutral" | "warning" | "danger"> = {
  baixa: "neutral",
  media: "warning",
  alta: "warning",
  critica: "danger",
};

const severidades: Severidade[] = ["baixa", "media", "alta", "critica"];
const statusOptions: StatusRisco[] = ["aberto", "mitigado", "encerrado"];

function EditRiscoForm({ risco, onDone }: { risco: Risco; onDone: () => void }) {
  const updateRisco = useUpdateRisco(risco.cliente_id);
  const [descricao, setDescricao] = useState(risco.descricao);
  const [categoria, setCategoria] = useState(risco.categoria ?? "");
  const [severidade, setSeveridade] = useState<Severidade>(risco.severidade);
  const [evidencias, setEvidencias] = useState(risco.evidencias ?? "");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!descricao.trim()) return;
    await updateRisco.mutateAsync({
      id: risco.id,
      data: {
        descricao,
        categoria: categoria || undefined,
        severidade,
        evidencias: evidencias || undefined,
      },
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        required
      />
      <Input
        placeholder="Categoria (opcional)"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />
      <select
        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        value={severidade}
        onChange={(e) => setSeveridade(e.target.value as Severidade)}
      >
        {severidades.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <textarea
        className="min-h-14 rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Evidências (opcional)"
        value={evidencias}
        onChange={(e) => setEvidencias(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={updateRisco.isPending}>
          {updateRisco.isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function RiscosSection({ clienteId }: { clienteId: string }) {
  const { data: riscos, isLoading } = useRiscos(clienteId);
  const createRisco = useCreateRisco(clienteId);
  const updateStatus = useUpdateRiscoStatus(clienteId);
  const deleteRisco = useDeleteRisco(clienteId);

  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [severidade, setSeveridade] = useState<Severidade>("media");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!descricao.trim()) return;
    await createRisco.mutateAsync({ descricao, severidade });
    setDescricao("");
    setSeveridade("media");
    setShowForm(false);
  }

  async function handleDelete(risco: Risco) {
    if (!window.confirm(`Excluir o risco "${risco.descricao}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    await deleteRisco.mutateAsync(risco.id);
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
              {severidades.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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
            {riscos.map((risco) =>
              editingId === risco.id ? (
                <li key={risco.id} className="rounded-md border border-border p-3">
                  <EditRiscoForm risco={risco} onDone={() => setEditingId(null)} />
                </li>
              ) : (
                <li key={risco.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">{risco.descricao}</p>
                    <div className="flex items-center gap-2">
                      <Badge tone={severidadeTone[risco.severidade]}>{risco.severidade}</Badge>
                      {risco.categoria && (
                        <span className="text-xs text-muted-foreground">{risco.categoria}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button variant="ghost" onClick={() => setEditingId(risco.id)}>
                      Editar
                    </Button>
                    <Button variant="ghost" onClick={() => handleDelete(risco)}>
                      Excluir
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum risco registrado.</p>
        )}
      </CardContent>
    </Card>
  );
}
