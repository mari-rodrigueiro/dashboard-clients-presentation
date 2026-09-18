import { type ChangeEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useConfirmImportCliente, usePreviewImportCliente } from "../../hooks/use-import-cliente";
import { useCreateGP, useGPs } from "../../hooks/use-gps";
import type {
  ClienteImportPreview,
  FaseCliente,
  RiscoImportado,
  Severidade,
} from "../../lib/types";

const fases: FaseCliente[] = [
  "onboarding",
  "adocao",
  "retencao",
  "expansao",
  "recuperacao",
  "encerrado",
];
const severidades: Severidade[] = ["baixa", "media", "alta", "critica"];

type PlanoTextKey =
  | "situacao_inicial"
  | "expectativa_sucesso"
  | "expectativa_curto_prazo"
  | "expectativa_medio_prazo"
  | "expectativa_longo_prazo";

const planoLabels: Array<{ key: PlanoTextKey; label: string }> = [
  { key: "situacao_inicial", label: "Situação inicial" },
  { key: "expectativa_sucesso", label: "Expectativa de sucesso" },
  { key: "expectativa_curto_prazo", label: "Curto prazo" },
  { key: "expectativa_medio_prazo", label: "Médio prazo" },
  { key: "expectativa_longo_prazo", label: "Longo prazo" },
];

export function ImportarClientePanel() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preview = usePreviewImportCliente();
  const confirm = useConfirmImportCliente();
  const { data: gps } = useGPs();
  const createGP = useCreateGP();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ClienteImportPreview | null>(null);
  const [gpId, setGpId] = useState("");
  const [novoGpNome, setNovoGpNome] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setForm(null);
    setGpId("");
    setNovoGpNome("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const conteudo = await file.text();
      const resultado = await preview.mutateAsync(conteudo);
      setForm(resultado);
      setGpId(resultado.gp_id_sugerido ?? "");
      setNovoGpNome(resultado.gp_id_sugerido ? "" : (resultado.gp_nome_sugerido ?? ""));
    } catch {
      setError(
        "Não foi possível interpretar o arquivo .md. Verifique o formato exportado do Notion.",
      );
    }
  }

  async function handleCreateGp() {
    if (!novoGpNome.trim()) return;
    const gp = await createGP.mutateAsync(novoGpNome.trim());
    setGpId(gp.id);
  }

  function updatePlanoField(key: PlanoTextKey, value: string) {
    if (!form) return;
    setForm({ ...form, plano_sucesso: { ...form.plano_sucesso, [key]: value } });
  }

  function updateRisco(index: number, patch: Partial<RiscoImportado>) {
    if (!form) return;
    const riscos = form.riscos.map((r, i) => (i === index ? { ...r, ...patch } : r));
    setForm({ ...form, riscos });
  }

  function removeRisco(index: number) {
    if (!form) return;
    setForm({ ...form, riscos: form.riscos.filter((_, i) => i !== index) });
  }

  async function handleConfirm() {
    if (!form) return;
    setError(null);
    if (!gpId) {
      setError("Selecione ou cadastre um GP antes de confirmar.");
      return;
    }
    try {
      const cliente = await confirm.mutateAsync({
        nome: form.nome,
        gp_id: gpId,
        fase: form.fase_sugerida,
        health_status: form.health_status_sugerido,
        contexto: form.contexto,
        data_entrada: form.data_entrada,
        plano_sucesso: form.plano_sucesso,
        riscos: form.riscos,
      });
      reset();
      setOpen(false);
      navigate(`/clientes/${cliente.id}`);
    } catch {
      setError("Não foi possível salvar o cliente importado.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Importar cliente (.md)</CardTitle>
        <Button
          variant="outline"
          onClick={() => {
            if (open) reset();
            setOpen((v) => !v);
          }}
        >
          {open ? "Cancelar" : "Importar de arquivo"}
        </Button>
      </CardHeader>
      {open && (
        <CardContent className="flex flex-col gap-4">
          {!form && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="import-file">
                Arquivo .md exportado do Notion (Plano de Sucesso do Cliente)
              </Label>
              <input
                id="import-file"
                ref={fileInputRef}
                type="file"
                accept=".md"
                onChange={handleFileChange}
                className="text-sm"
              />
              {preview.isPending && (
                <p className="text-sm text-muted-foreground">Lendo arquivo...</p>
              )}
            </div>
          )}

          {form && (
            <div className="flex flex-col gap-5">
              {form.avisos.length > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">Revise antes de confirmar:</p>
                  <ul className="ml-4 list-disc">
                    {form.avisos.map((aviso, i) => (
                      <li key={i}>{aviso}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="import-nome">Nome do cliente</Label>
                <Input
                  id="import-nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="import-gp">
                  GP responsável (a partir do Gerente de Projeto Lecom do documento)
                </Label>
                <select
                  id="import-gp"
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={gpId}
                  onChange={(e) => setGpId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {(gps ?? []).map((gp) => (
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="import-fase">Fase</Label>
                  <select
                    id="import-fase"
                    className="h-10 rounded-md border border-border bg-background px-3 text-sm capitalize"
                    value={form.fase_sugerida}
                    onChange={(e) =>
                      setForm({ ...form, fase_sugerida: e.target.value as FaseCliente })
                    }
                  >
                    {fases.map((f) => (
                      <option key={f} value={f}>
                        {f.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="import-data">Data de entrada</Label>
                  <Input
                    id="import-data"
                    type="date"
                    value={form.data_entrada}
                    onChange={(e) => setForm({ ...form, data_entrada: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="import-contexto">Contexto (metadados do documento)</Label>
                <textarea
                  id="import-contexto"
                  className="min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.contexto}
                  onChange={(e) => setForm({ ...form, contexto: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium">Plano de Sucesso</p>
                {planoLabels.map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <Label htmlFor={`import-plano-${key}`}>{label}</Label>
                    <textarea
                      id={`import-plano-${key}`}
                      className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={form.plano_sucesso[key]}
                      onChange={(e) => updatePlanoField(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Riscos identificados</p>
                {form.riscos.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum risco identificado.</p>
                )}
                {form.riscos.map((risco, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-md border border-border p-3"
                  >
                    <textarea
                      className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={risco.descricao}
                      onChange={(e) => updateRisco(index, { descricao: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <select
                        className="h-9 rounded-md border border-border bg-background px-2 text-sm"
                        value={risco.severidade}
                        onChange={(e) =>
                          updateRisco(index, { severidade: e.target.value as Severidade })
                        }
                      >
                        {severidades.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <Button type="button" variant="ghost" onClick={() => removeRisco(index)}>
                        Remover
                      </Button>
                    </div>
                    <textarea
                      className="min-h-14 rounded-md border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Evidências / ações"
                      value={risco.evidencias ?? ""}
                      onChange={(e) => updateRisco(index, { evidencias: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center gap-3">
                <Button onClick={handleConfirm} disabled={confirm.isPending}>
                  {confirm.isPending ? "Salvando..." : "Confirmar e importar"}
                </Button>
                <Button type="button" variant="ghost" onClick={reset}>
                  Recomeçar
                </Button>
              </div>
            </div>
          )}

          {error && !form && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      )}
    </Card>
  );
}
