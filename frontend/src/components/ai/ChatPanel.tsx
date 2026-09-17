import { Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useSendChatMessage } from "../../hooks/use-ai-chat";
import { useCreateMemoria } from "../../hooks/use-memorias";
import { ApiError } from "../../lib/api-client";
import type { ReferenciaUtilizada } from "../../lib/types";
import { Button } from "../ui/button";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

interface ChatEntry {
  papel: "user" | "assistant";
  conteudo: string;
  perguntaOrigem?: string;
  referencias?: ReferenciaUtilizada[];
  salvoComoAprendizado?: boolean;
}

export function ChatPanel({ clienteId }: { clienteId: string }) {
  const sendMessage = useSendChatMessage();
  const createMemoria = useCreateMemoria(clienteId);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [historico, setHistorico] = useState<ChatEntry[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const pergunta = mensagem.trim();
    if (!pergunta) return;

    setErro(null);
    setHistorico((h) => [...h, { papel: "user", conteudo: pergunta }]);
    setMensagem("");

    try {
      const resposta = await sendMessage.mutateAsync({
        session_id: sessionId,
        cliente_id: clienteId,
        mensagem: pergunta,
      });
      setSessionId(resposta.session_id);
      setHistorico((h) => [
        ...h,
        {
          papel: "assistant",
          conteudo: resposta.mensagem,
          perguntaOrigem: pergunta,
          referencias: resposta.referencias_utilizadas,
        },
      ]);
    } catch (err) {
      const detail =
        err instanceof ApiError && typeof err.detail === "string"
          ? err.detail
          : "Não foi possível obter resposta da IA.";
      setErro(detail);
    }
  }

  async function handleSalvarAprendizado(index: number, entry: ChatEntry) {
    await createMemoria.mutateAsync({
      cliente_id: clienteId,
      origem_sessao_id: sessionId,
      titulo: entry.perguntaOrigem?.slice(0, 100) ?? "Aprendizado do chat",
      conteudo: entry.conteudo,
      tipo: "insight",
    });
    setHistorico((h) =>
      h.map((e, i) => (i === index ? { ...e, salvoComoAprendizado: true } : e))
    );
  }

  return (
    <div className="glass-ai rounded-xl">
      <CardHeader className="flex flex-row items-center gap-2">
        <Sparkles className="h-4 w-4 text-ai" />
        <CardTitle className="text-ai">Assistente de IA</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {historico.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Pergunte algo sobre este cliente — a resposta é baseada só nos registros já
              cadastrados.
            </p>
          )}
          {historico.map((entry, i) => (
            <div
              key={i}
              className={
                entry.papel === "user"
                  ? "self-end rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "self-start rounded-md border border-ai/20 bg-white/70 px-3 py-2 text-sm"
              }
            >
              <p>{entry.conteudo}</p>
              {entry.referencias && entry.referencias.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Fontes: {entry.referencias.map((r) => r.titulo).join(", ")}
                </p>
              )}
              {entry.papel === "assistant" && (
                <button
                  type="button"
                  className="mt-1 text-xs text-ai hover:underline disabled:text-muted-foreground"
                  disabled={entry.salvoComoAprendizado || createMemoria.isPending}
                  onClick={() => handleSalvarAprendizado(i, entry)}
                >
                  {entry.salvoComoAprendizado ? "Salvo como aprendizado ✓" : "Salvar como aprendizado"}
                </button>
              )}
            </div>
          ))}
          {sendMessage.isPending && <p className="text-sm text-muted-foreground">Pensando...</p>}
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Pergunte sobre este cliente..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
          <Button type="submit" variant="ai" disabled={sendMessage.isPending}>
            Enviar
          </Button>
        </form>
      </CardContent>
    </div>
  );
}
