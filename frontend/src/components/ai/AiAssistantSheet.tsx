import { Sparkles, X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "../ui/button";
import { ChatPanel } from "./ChatPanel";

/**
 * Painel lateral do assistente de IA da carteira (sem cliente escopado) — acessível de
 * qualquer tela pelo cabeçalho (AppShell). Reaproveita o mesmo ChatPanel da página do
 * cliente, só que com `clienteId` ausente (busca textual entre clientes, context_builder.py).
 */
export function AiAssistantSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar assistente de IA"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-rise relative flex h-full w-[420px] max-w-[90vw] flex-col overflow-y-auto border-l border-ai/20 bg-background p-4 shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X className="size-4" />
        </Button>
        <ChatPanel />
      </div>
    </div>
  );
}

export function AiAssistantTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ai" size="sm" onClick={onClick}>
      <Sparkles className="size-4" />
      Perguntar à IA
    </Button>
  );
}
