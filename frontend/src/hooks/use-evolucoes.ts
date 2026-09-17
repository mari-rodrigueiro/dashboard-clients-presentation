import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { Evolucao, EvolucaoCreateInput } from "../lib/types";

export function useEvolucoes(clienteId: string) {
  return useQuery({
    queryKey: ["evolucoes", clienteId],
    queryFn: () => apiClient.get<Evolucao[]>(`/clients/${clienteId}/evolutions`),
  });
}

export function useCreateEvolucao(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EvolucaoCreateInput) =>
      apiClient.post<Evolucao>(`/clients/${clienteId}/evolutions`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["evolucoes", clienteId] }),
  });
}
