import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "../../lib/api-client";
import { renderWithQueryClient } from "../../test/test-utils";
import { Timeline } from "./Timeline";

vi.mock("../../lib/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
  ApiError: class ApiError extends Error {},
}));

describe("Timeline", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
  });

  it("lista as evoluções já registradas", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([
      {
        id: "e1",
        cliente_id: "cliente-1",
        data_referencia: "2024-03-01",
        titulo: "Reunião de alinhamento",
        contexto: "ctx",
        situacao: "Cliente insatisfeito",
        acao_realizada: "Escalado",
        resultado: null,
        evidencia: null,
        responsavel_id: null,
        impacto_percebido: null,
        impacto_detalhe: null,
        observacoes: null,
        tags: ["critico"],
        created_at: "2024-03-01T00:00:00Z",
        updated_at: "2024-03-01T00:00:00Z",
      },
    ]);

    renderWithQueryClient(<Timeline clienteId="cliente-1" />);

    expect(await screen.findByText("Reunião de alinhamento")).toBeInTheDocument();
    expect(screen.getByText("Cliente insatisfeito")).toBeInTheDocument();
    expect(screen.getByText("critico")).toBeInTheDocument();
  });

  it("exige título, contexto, situação e ação realizada para registrar uma evolução", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]);
    renderWithQueryClient(<Timeline clienteId="cliente-1" />);

    await waitFor(() => screen.getByText("Nenhum registro de evolução ainda."));
    await userEvent.click(screen.getByRole("button", { name: "Nova evolução" }));

    const titulo = screen.getByLabelText("Título");
    const submitButton = screen.getByRole("button", { name: "Registrar evolução" });

    // título vazio: o form não deve submeter (validação HTML5 required)
    await userEvent.click(submitButton);
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(titulo).toBeInvalid();
  });

  it("registra uma nova evolução com tags separadas por vírgula", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]);
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      id: "e2",
      cliente_id: "cliente-1",
      data_referencia: "2024-03-01",
      titulo: "Novo registro",
      contexto: "contexto",
      situacao: "situação",
      acao_realizada: "ação",
      resultado: null,
      evidencia: null,
      responsavel_id: null,
      impacto_percebido: null,
      impacto_detalhe: null,
      observacoes: null,
      tags: ["performance", "critico"],
      created_at: "2024-03-01T00:00:00Z",
      updated_at: "2024-03-01T00:00:00Z",
    });

    renderWithQueryClient(<Timeline clienteId="cliente-1" />);
    await waitFor(() => screen.getByText("Nenhum registro de evolução ainda."));
    await userEvent.click(screen.getByRole("button", { name: "Nova evolução" }));

    await userEvent.type(screen.getByLabelText("Título"), "Novo registro");
    await userEvent.type(screen.getByLabelText("Contexto"), "contexto");
    await userEvent.type(screen.getByLabelText("Situação"), "situação");
    await userEvent.type(screen.getByLabelText("Ação realizada"), "ação");
    await userEvent.type(screen.getByLabelText("Tags (separadas por vírgula)"), "performance, critico");
    await userEvent.click(screen.getByRole("button", { name: "Registrar evolução" }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/clients/cliente-1/evolutions",
        expect.objectContaining({
          titulo: "Novo registro",
          tags: ["performance", "critico"],
        })
      );
    });
  });
});
