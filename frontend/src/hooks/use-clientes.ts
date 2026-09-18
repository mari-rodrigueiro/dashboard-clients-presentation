import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type {
  Cliente,
  ClienteCreateInput,
  ClienteFiltros,
  ClienteUpdateInput,
} from "../lib/types";

export function useClientes(filtros: ClienteFiltros = {}) {
  const params = new URLSearchParams();
  if (filtros.gp_id) params.set("gp_id", filtros.gp_id);
  if (filtros.fase) params.set("fase", filtros.fase);
  if (filtros.health_status) params.set("health_status", filtros.health_status);
  if (filtros.q) params.set("q", filtros.q);
  if (filtros.ativo !== undefined) params.set("ativo", String(filtros.ativo));
  const query = params.toString();

  return useQuery({
    queryKey: ["clientes", filtros],
    queryFn: () => apiClient.get<Cliente[]>(`/clients${query ? `?${query}` : ""}`),
  });
}

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: ["clientes", id],
    queryFn: () => apiClient.get<Cliente>(`/clients/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteCreateInput) => apiClient.post<Cliente>("/clients", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useUpdateCliente(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteUpdateInput) => apiClient.put<Cliente>(`/clients/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      queryClient.invalidateQueries({ queryKey: ["clientes", id] });
    },
  });
}
