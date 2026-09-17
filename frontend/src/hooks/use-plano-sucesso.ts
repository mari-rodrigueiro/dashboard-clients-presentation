import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient, ApiError } from "../lib/api-client";
import type { PlanoSucesso, PlanoSucessoInput } from "../lib/types";

export function usePlanoSucesso(clienteId: string) {
  return useQuery({
    queryKey: ["plano-sucesso", clienteId],
    queryFn: async () => {
      try {
        return await apiClient.get<PlanoSucesso>(`/clients/${clienteId}/success-plan`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });
}

export function useUpsertPlanoSucesso(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PlanoSucessoInput) =>
      apiClient.put<PlanoSucesso>(`/clients/${clienteId}/success-plan`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plano-sucesso", clienteId] }),
  });
}
