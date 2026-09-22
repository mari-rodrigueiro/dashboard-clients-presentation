import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { Cliente, HealthStatus } from "../../lib/types";
import { ResumoCarteiraCard } from "./ResumoCarteiraCard";

function cliente(id: string, nome: string, health_status: HealthStatus): Cliente {
  return {
    id,
    nome,
    health_status,
    gp: { id: "gp1", nome: "GP", email: null, created_at: "", updated_at: "" },
    segmento: null,
    fase: "adocao",
    contexto: null,
    data_entrada: "2024-01-01",
    ativo: true,
    created_at: "",
    updated_at: "",
  } as Cliente;
}

describe("ResumoCarteiraCard", () => {
  it("agrupa por saúde, com links para os clientes, e esconde grupo vazio", () => {
    render(
      <MemoryRouter>
        <ResumoCarteiraCard
          clientes={[
            cliente("c2", "Delta", "saudavel"),
            cliente("c1", "Alpha", "saudavel"),
            cliente("c3", "Gamma", "critico"),
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Avanço consistente")).toBeInTheDocument();
    expect(screen.getByText("Ação imediata")).toBeInTheDocument();
    expect(screen.queryByText("Atenção preventiva")).not.toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Alpha", "Delta", "Gamma"]);
    expect(links[0]).toHaveAttribute("href", "/clientes/c1");
  });

  it("sem clientes ativos mostra aviso em vez de grupos", () => {
    render(
      <MemoryRouter>
        <ResumoCarteiraCard clientes={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Nenhum cliente ativo no momento.")).toBeInTheDocument();
  });
});
