import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { Acao, AcaoCreateInput, AcaoUpdateInput, StatusAcao } from "../lib/types";

export function useAcoes(clienteId: string) {
  return useQuery({
    queryKey: ["acoes", clienteId],
    queryFn: () => apiClient.get<Acao[]>(`/clients/${clienteId}/actions`),
  });
}

export function useCreateAcao(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AcaoCreateInput) =>
      apiClient.post<Acao>(`/clients/${clienteId}/actions`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["acoes", clienteId] }),
  });
}

export function useUpdateAcaoStatus(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusAcao }) =>
      apiClient.put<Acao>(`/actions/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["acoes", clienteId] }),
  });
}

export function useUpdateAcao(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcaoUpdateInput }) =>
      apiClient.put<Acao>(`/actions/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["acoes", clienteId] }),
  });
}

export function useDeleteAcao(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/actions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["acoes", clienteId] }),
  });
}
