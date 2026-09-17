import { type FormEvent, useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { usePlanoSucesso, useUpsertPlanoSucesso } from "../../hooks/use-plano-sucesso";

const campos: Array<{ key: keyof FormState; label: string; required: boolean }> = [
  { key: "situacao_inicial", label: "Situação inicial", required: true },
  { key: "expectativa_sucesso", label: "O que é sucesso para este cliente", required: true },
  { key: "expectativa_curto_prazo", label: "Expectativa de curto prazo", required: true },
  { key: "expectativa_medio_prazo", label: "Expectativa de médio prazo", required: true },
  { key: "expectativa_longo_prazo", label: "Expectativa de longo prazo", required: true },
  { key: "desafios", label: "Desafios", required: false },
  { key: "resumo_riscos", label: "Resumo de riscos", required: false },
  { key: "resumo_oportunidades", label: "Resumo de oportunidades", required: false },
];

interface FormState {
  situacao_inicial: string;
  expectativa_sucesso: string;
  expectativa_curto_prazo: string;
  expectativa_medio_prazo: string;
  expectativa_longo_prazo: string;
  resumo_riscos: string;
  resumo_oportunidades: string;
  desafios: string;
}

const emptyForm: FormState = {
  situacao_inicial: "",
  expectativa_sucesso: "",
  expectativa_curto_prazo: "",
  expectativa_medio_prazo: "",
  expectativa_longo_prazo: "",
  resumo_riscos: "",
  resumo_oportunidades: "",
  desafios: "",
};

export function PlanoSucessoSection({ clienteId }: { clienteId: string }) {
  const { data: plano, isLoading } = usePlanoSucesso(clienteId);
  const upsert = useUpsertPlanoSucesso(clienteId);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (plano) {
      setForm({
        situacao_inicial: plano.situacao_inicial,
        expectativa_sucesso: plano.expectativa_sucesso,
        expectativa_curto_prazo: plano.expectativa_curto_prazo,
        expectativa_medio_prazo: plano.expectativa_medio_prazo,
        expectativa_longo_prazo: plano.expectativa_longo_prazo,
        resumo_riscos: plano.resumo_riscos ?? "",
        resumo_oportunidades: plano.resumo_oportunidades ?? "",
        desafios: plano.desafios ?? "",
      });
    } else if (!isLoading) {
      setEditing(true);
    }
  }, [plano, isLoading]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await upsert.mutateAsync(form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plano de Sucesso</CardTitle>
        {plano && !editing && (
          <Button variant="outline" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {campos.map(({ key, label, required }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <Label htmlFor={key}>{label}</Label>
                <textarea
                  id={key}
                  className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form[key]}
                  required={required}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={upsert.isPending}>
                {upsert.isPending ? "Salvando..." : "Salvar plano"}
              </Button>
              {plano && (
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              )}
              {saved && <span className="text-sm text-emerald-700">Salvo.</span>}
            </div>
          </form>
        ) : plano ? (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {campos
              .filter(({ key }) => form[key])
              .map(({ key, label }) => (
                <div key={key}>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
                  <dd className="text-sm">{form[key]}</dd>
                </div>
              ))}
          </dl>
        ) : null}
      </CardContent>
    </Card>
  );
}
