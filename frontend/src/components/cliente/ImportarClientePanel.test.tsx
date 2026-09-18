import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "../../lib/api-client";
import { renderWithQueryClient } from "../../test/test-utils";
import { ImportarClientePanel } from "./ImportarClientePanel";

vi.mock("../../lib/api-client", () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
  ApiError: class ApiError extends Error {},
}));

const PREVIEW = {
  nome: "Miracema Nuodex",
  gp_nome_sugerido: "Mariana Rodrigueiro",
  gp_id_sugerido: "gp-1",
  fase_sugerida: "retencao",
  health_status_sugerido: "saudavel",
  contexto: "Cod. Cliente: 5313",
  data_entrada: "2026-07-27",
  plano_sucesso: {
    situacao_inicial: "Situação",
    expectativa_sucesso: "Sucesso",
    expectativa_curto_prazo: "Curto",
    expectativa_medio_prazo: "Médio",
    expectativa_longo_prazo: "Longo",
    resumo_riscos: null,
    resumo_oportunidades: null,
    desafios: null,
  },
  riscos: [{ descricao: "Perda de conhecimento", severidade: "alta", evidencias: "Ana Paula" }],
  avisos: ["Situação inicial não existe como campo separado neste template"],
};

function renderPanel() {
  return renderWithQueryClient(
    <MemoryRouter>
      <ImportarClientePanel />
    </MemoryRouter>,
  );
}

describe("ImportarClientePanel", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(apiClient.post).mockReset();
    vi.mocked(apiClient.get).mockResolvedValue([
      { id: "gp-1", nome: "Mariana Rodrigueiro", email: null, created_at: "2026-01-01" },
    ]);
  });

  it("faz upload do .md, mostra a prévia com avisos e riscos, e confirma a importação", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(PREVIEW);

    renderPanel();

    await userEvent.click(screen.getByRole("button", { name: "Importar de arquivo" }));

    const file = new File(["# Miracema Nuodex\n"], "plano.md", { type: "text/markdown" });
    const input = screen.getByLabelText(/Arquivo \.md/);
    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/clients/import-md/preview", {
        conteudo_md: "# Miracema Nuodex\n",
      });
    });

    expect(await screen.findByDisplayValue("Miracema Nuodex")).toBeInTheDocument();
    expect(screen.getByText(/Situação inicial não existe/)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Perda de conhecimento")).toBeInTheDocument();

    vi.mocked(apiClient.post).mockResolvedValueOnce({ id: "cliente-1", nome: "Miracema Nuodex" });

    await userEvent.click(screen.getByRole("button", { name: "Confirmar e importar" }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenLastCalledWith(
        "/clients/import-md/confirm",
        expect.objectContaining({ nome: "Miracema Nuodex", gp_id: "gp-1" }),
      );
    });
  });

  it("mostra erro quando o arquivo não pode ser interpretado", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error("falhou"));

    renderPanel();

    await userEvent.click(screen.getByRole("button", { name: "Importar de arquivo" }));
    const file = new File(["conteudo qualquer"], "plano.md", { type: "text/markdown" });
    await userEvent.upload(screen.getByLabelText(/Arquivo \.md/), file);

    expect(await screen.findByText(/Não foi possível interpretar o arquivo/)).toBeInTheDocument();
  });
});
