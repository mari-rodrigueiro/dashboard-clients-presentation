import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { Evolucao, EvolucaoCreateInput, EvolucaoUpdateInput } from "../lib/types";

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

export function useUpdateEvolucao(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EvolucaoUpdateInput }) =>
      apiClient.put<Evolucao>(`/evolutions/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["evolucoes", clienteId] }),
  });
}
