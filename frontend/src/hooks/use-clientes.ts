import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { Cliente, ClienteCreateInput, ClienteUpdateInput } from "../lib/types";

export function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: () => apiClient.get<Cliente[]>("/clients"),
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
