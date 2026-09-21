import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiClient } from "../../lib/api-client";
import type { Cliente } from "../../lib/types";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const termo = query.trim();
    if (termo.length < 2) {
      setResultados([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const clientes = await apiClient.get<Cliente[]>(
          `/clients?q=${encodeURIComponent(termo)}&limit=6`,
        );
        setResultados(clientes);
        setAberto(true);
      } catch {
        setResultados([]);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function irPara(cliente: Cliente) {
    setQuery("");
    setResultados([]);
    setAberto(false);
    navigate(`/clientes/${cliente.id}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => resultados.length > 0 && setAberto(true)}
        placeholder="Buscar cliente, GP ou segmento..."
        aria-label="Busca global"
        className="h-10 w-full rounded-md border border-border bg-card px-3 pl-10 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      />
      {aberto && resultados.length > 0 && (
        <div className="glass absolute z-20 mt-2 w-full overflow-hidden rounded-lg shadow-lg">
          {resultados.map((cliente) => (
            <button
              key={cliente.id}
              type="button"
              onClick={() => irPara(cliente)}
              className="flex w-full flex-col items-start px-4 py-2 text-left text-sm hover:bg-accent/10"
            >
              <span className="font-medium">{cliente.nome}</span>
              <span className="text-xs text-muted-foreground">{cliente.gp.nome}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
