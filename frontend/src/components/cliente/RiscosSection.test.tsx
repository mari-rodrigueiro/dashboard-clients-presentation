import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "../../lib/api-client";
import { renderWithQueryClient } from "../../test/test-utils";
import { RiscosSection } from "./RiscosSection";

vi.mock("../../lib/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  ApiError: class ApiError extends Error {},
}));

const RISCO = {
  id: "r1",
  cliente_id: "cliente-1",
  descricao: "Risco de churn",
  categoria: null,
  severidade: "media",
  status: "aberto",
  evidencias: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("RiscosSection", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.put).mockReset();
    vi.mocked(apiClient.delete).mockReset();
  });

  it("edita um risco existente com todos os campos", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([RISCO]);
    vi.mocked(apiClient.put).mockResolvedValueOnce({
      ...RISCO,
      descricao: "Risco de churn revisado",
      severidade: "alta",
      evidencias: "E-mail do cliente",
    });

    renderWithQueryClient(<RiscosSection clienteId="cliente-1" />);

    expect(await screen.findByText("Risco de churn")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));

    const descricaoInput = screen.getByDisplayValue("Risco de churn");
    await userEvent.clear(descricaoInput);
    await userEvent.type(descricaoInput, "Risco de churn revisado");

    const evidenciasInput = screen.getByPlaceholderText("Evidências (opcional)");
    await userEvent.type(evidenciasInput, "E-mail do cliente");

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalledWith(
        "/risks/r1",
        expect.objectContaining({
          descricao: "Risco de churn revisado",
          evidencias: "E-mail do cliente",
        }),
      );
    });
  });

  it("exclui um risco após confirmação", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([RISCO]);
    vi.mocked(apiClient.delete).mockResolvedValueOnce(undefined);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithQueryClient(<RiscosSection clienteId="cliente-1" />);

    expect(await screen.findByText("Risco de churn")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith("/risks/r1");
    });

    confirmSpy.mockRestore();
  });

  it("não exclui quando o usuário cancela a confirmação", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([RISCO]);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithQueryClient(<RiscosSection clienteId="cliente-1" />);

    expect(await screen.findByText("Risco de churn")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(apiClient.delete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });
});
