import { type FormEvent, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useCreateEvolucao, useEvolucoes, useUpdateEvolucao } from "../../hooks/use-evolucoes";
import type { Evolucao, Impacto } from "../../lib/types";

const impactoTone: Record<Impacto, "success" | "neutral" | "danger"> = {
  positivo: "success",
  neutro: "neutral",
  negativo: "danger",
};

function EditEvolucaoForm({ evolucao, onDone }: { evolucao: Evolucao; onDone: () => void }) {
  const updateEvolucao = useUpdateEvolucao(evolucao.cliente_id);
  const [dataReferencia, setDataReferencia] = useState(evolucao.data_referencia);
  const [titulo, setTitulo] = useState(evolucao.titulo);
  const [contexto, setContexto] = useState(evolucao.contexto);
  const [situacao, setSituacao] = useState(evolucao.situacao);
  const [acaoRealizada, setAcaoRealizada] = useState(evolucao.acao_realizada);
  const [resultado, setResultado] = useState(evolucao.resultado ?? "");
  const [tags, setTags] = useState(evolucao.tags.join(", "));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await updateEvolucao.mutateAsync({
      id: evolucao.id,
      data: {
        data_referencia: dataReferencia,
        titulo,
        contexto,
        situacao,
        acao_realizada: acaoRealizada,
        resultado: resultado || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
    });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="date"
          value={dataReferencia}
          onChange={(e) => setDataReferencia(e.target.value)}
          required
        />
        <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      </div>
      <textarea
        className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Contexto"
        value={contexto}
        onChange={(e) => setContexto(e.target.value)}
        required
      />
      <textarea
        className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Situação"
        value={situacao}
        onChange={(e) => setSituacao(e.target.value)}
        required
      />
      <textarea
        className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Ação realizada"
        value={acaoRealizada}
        onChange={(e) => setAcaoRealizada(e.target.value)}
        required
      />
      <textarea
        className="min-h-14 rounded-md border border-border bg-background px-3 py-2 text-sm"
        placeholder="Resultado (opcional)"
        value={resultado}
        onChange={(e) => setResultado(e.target.value)}
      />
      <Input
        placeholder="Tags (separadas por vírgula)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={updateEvolucao.isPending}>
          {updateEvolucao.isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function Timeline({ clienteId }: { clienteId: string }) {
  const { data: evolucoes, isLoading } = useEvolucoes(clienteId);
  const createEvolucao = useCreateEvolucao(clienteId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dataReferencia, setDataReferencia] = useState(() => new Date().toISOString().slice(0, 10));
  const [titulo, setTitulo] = useState("");
  const [contexto, setContexto] = useState("");
  const [situacao, setSituacao] = useState("");
  const [acaoRealizada, setAcaoRealizada] = useState("");
  const [resultado, setResultado] = useState("");
  const [tags, setTags] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await createEvolucao.mutateAsync({
      data_referencia: dataReferencia,
      titulo,
      contexto,
      situacao,
      acao_realizada: acaoRealizada,
      resultado: resultado || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setTitulo("");
    setContexto("");
    setSituacao("");
    setAcaoRealizada("");
    setResultado("");
    setTags("");
    setShowForm(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Timeline de evolução</CardTitle>
        <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "Nova evolução"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {showForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 border-b border-border pb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="data_referencia">Data</Label>
                <Input
                  id="data_referencia"
                  type="date"
                  value={dataReferencia}
                  onChange={(e) => setDataReferencia(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contexto">Contexto</Label>
              <textarea
                id="contexto"
                className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="situacao">Situação</Label>
              <textarea
                id="situacao"
                className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={situacao}
                onChange={(e) => setSituacao(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acao_realizada">Ação realizada</Label>
              <textarea
                id="acao_realizada"
                className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={acaoRealizada}
                onChange={(e) => setAcaoRealizada(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="resultado">Resultado</Label>
              <textarea
                id="resultado"
                className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <Button type="submit" disabled={createEvolucao.isPending}>
              {createEvolucao.isPending ? "Salvando..." : "Registrar evolução"}
            </Button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : evolucoes && evolucoes.length > 0 ? (
          <ol className="flex flex-col gap-5 border-l border-border pl-4">
            {evolucoes.map((evolucao) =>
              editingId === evolucao.id ? (
                <li key={evolucao.id} className="relative rounded-md border border-border p-3">
                  <EditEvolucaoForm evolucao={evolucao} onDone={() => setEditingId(null)} />
                </li>
              ) : (
                <li key={evolucao.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{evolucao.data_referencia}</p>
                    <Button variant="ghost" onClick={() => setEditingId(evolucao.id)}>
                      Editar
                    </Button>
                  </div>
                  <p className="font-medium">{evolucao.titulo}</p>
                  <p className="text-sm text-muted-foreground">{evolucao.situacao}</p>
                  <p className="text-sm">
                    <span className="font-medium">Ação: </span>
                    {evolucao.acao_realizada}
                  </p>
                  {evolucao.resultado && (
                    <p className="text-sm">
                      <span className="font-medium">Resultado: </span>
                      {evolucao.resultado}
                    </p>
                  )}
                  {evolucao.impacto_percebido && (
                    <Badge tone={impactoTone[evolucao.impacto_percebido]}>
                      {evolucao.impacto_percebido}
                    </Badge>
                  )}
                  {evolucao.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {evolucao.tags.map((tag) => (
                        <Badge key={tag} tone="neutral">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </li>
              ),
            )}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhum registro de evolução ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
