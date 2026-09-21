import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "../../lib/api-client";
import { renderWithQueryClient } from "../../test/test-utils";
import { ChatPanel } from "./ChatPanel";

vi.mock("../../lib/api-client", () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
  ApiError: class ApiError extends Error {},
}));

describe("ChatPanel", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("envia a pergunta, mostra a resposta com as fontes citadas e permite promover como aprendizado", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      session_id: "session-1",
      mensagem: "O principal risco é o preço [1].",
      referencias_utilizadas: [{ source_type: "risco", source_id: "r1", titulo: "Risco (aberto)" }],
    });

    renderWithQueryClient(<ChatPanel clienteId="cliente-1" />);

    const input = screen.getByPlaceholderText("Pergunte sobre este cliente...");
    await userEvent.type(input, "Quais os riscos desse cliente?");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(apiClient.post).toHaveBeenCalledWith("/ai/chat", {
      session_id: undefined,
      cliente_id: "cliente-1",
      mensagem: "Quais os riscos desse cliente?",
    });

    await waitFor(() => {
      expect(screen.getByText("O principal risco é o preço [1].")).toBeInTheDocument();
    });
    expect(screen.getByText(/Fontes: Risco \(aberto\)/)).toBeInTheDocument();

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      id: "mem-1",
      cliente_id: "cliente-1",
      titulo: "Quais os riscos desse cliente?",
      conteudo: "O principal risco é o preço [1].",
      tipo: "insight",
      criado_por: "user@example.com",
      created_at: "2026-09-17T00:00:00Z",
    });

    await userEvent.click(screen.getByRole("button", { name: "Salvar como aprendizado" }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenLastCalledWith(
        "/memories",
        expect.objectContaining({ cliente_id: "cliente-1", tipo: "insight" }),
      );
    });
    expect(await screen.findByText("Salvo como aprendizado ✓")).toBeInTheDocument();
  });

  it("mostra uma mensagem de erro quando a chamada falha", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("falhou"));

    renderWithQueryClient(<ChatPanel clienteId="cliente-1" />);

    await userEvent.type(
      screen.getByPlaceholderText("Pergunte sobre este cliente..."),
      "Pergunta qualquer",
    );
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Não foi possível obter resposta da IA.")).toBeInTheDocument();
  });
});
