import { type FormEvent, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  useCreateOportunidade,
  useDeleteOportunidade,
  useOportunidades,
  useUpdateOportunidade,
  useUpdateOportunidadeStatus,
} from "../../hooks/use-oportunidades";
import type { Oportunidade, Potencial, StatusOportunidade } from "../../lib/types";

const potencialTone: Record<Potencial, "neutral" | "warning" | "success"> = {
  baixo: "neutral",
  medio: "warning",
  alto: "success",
};

const potenciais: Potencial[] = ["baixo", "medio", "alto"];
const statusOptions: StatusOportunidade[] = [
  "identificada",
  "em_analise",
  "em_execucao",
  "concretizada",
  "descartada",
];

function EditOportunidadeForm({
  oportunidade,
  onDone,
}: {
  oportunidade: Oportunidade;
  onDone: () => void;
}) {
  const updateOportunidade = useUpdateOportunidade(oportunidade.cliente_id);
  const [descricao, setDescricao] = useState(oportunidade.descricao);
  const [categoria, setCategoria] = useState(oportunidade.categoria ?? "");
  const [potencial, setPotencial] = useState<Potencial>(oportunidade.potencial);
  const [evidencias, setEvidencias] = useState(oportunidade.evidencias ?? "");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!descricao.trim()) return;
    await updateOportunidade.mutateAsync({
      id: oportunidade.id,
      data: {
        descricao,
        categoria: categoria || undefined,
        potencial,
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
        value={potencial}
        onChange={(e) => setPotencial(e.target.value as Potencial)}
      >
        {potenciais.map((p) => (
          <option key={p} value={p}>
            {p}
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
        <Button type="submit" disabled={updateOportunidade.isPending}>
          {updateOportunidade.isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function OportunidadesSection({ clienteId }: { clienteId: string }) {
  const { data: oportunidades, isLoading } = useOportunidades(clienteId);
  const createOportunidade = useCreateOportunidade(clienteId);
  const updateStatus = useUpdateOportunidadeStatus(clienteId);
  const deleteOportunidade = useDeleteOportunidade(clienteId);

  const [showForm, setShowForm] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [potencial, setPotencial] = useState<Potencial>("medio");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!descricao.trim()) return;
    await createOportunidade.mutateAsync({ descricao, potencial });
    setDescricao("");
    setPotencial("medio");
    setShowForm(false);
  }

  async function handleDelete(oportunidade: Oportunidade) {
    if (
      !window.confirm(
        `Excluir a oportunidade "${oportunidade.descricao}"? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    await deleteOportunidade.mutateAsync(oportunidade.id);
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
            {oportunidades.map((oportunidade) =>
              editingId === oportunidade.id ? (
                <li key={oportunidade.id} className="rounded-md border border-border p-3">
                  <EditOportunidadeForm
                    oportunidade={oportunidade}
                    onDone={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li key={oportunidade.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm">{oportunidade.descricao}</p>
                    <div className="flex items-center gap-2">
                      <Badge tone={potencialTone[oportunidade.potencial]}>
                        {oportunidade.potencial}
                      </Badge>
                      {oportunidade.categoria && (
                        <span className="text-xs text-muted-foreground">
                          {oportunidade.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button variant="ghost" onClick={() => setEditingId(oportunidade.id)}>
                      Editar
                    </Button>
                    <Button variant="ghost" onClick={() => handleDelete(oportunidade)}>
                      Excluir
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma oportunidade registrada.</p>
        )}
      </CardContent>
    </Card>
  );
}
