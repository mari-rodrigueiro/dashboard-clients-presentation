import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { Memoria, MemoriaCreateInput } from "../lib/types";

export function useMemorias(clienteId: string) {
  return useQuery({
    queryKey: ["memorias", clienteId],
    queryFn: () => apiClient.get<Memoria[]>(`/clients/${clienteId}/memories`),
  });
}

export function useCreateMemoria(clienteId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MemoriaCreateInput) => apiClient.post<Memoria>("/memories", data),
    onSuccess: () => {
      if (clienteId) queryClient.invalidateQueries({ queryKey: ["memorias", clienteId] });
    },
  });
}
