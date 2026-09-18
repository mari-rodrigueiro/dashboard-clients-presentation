import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type {
  Oportunidade,
  OportunidadeCreateInput,
  OportunidadeUpdateInput,
  StatusOportunidade,
} from "../lib/types";

export function useOportunidades(clienteId: string) {
  return useQuery({
    queryKey: ["oportunidades", clienteId],
    queryFn: () => apiClient.get<Oportunidade[]>(`/clients/${clienteId}/opportunities`),
  });
}

export function useCreateOportunidade(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OportunidadeCreateInput) =>
      apiClient.post<Oportunidade>(`/clients/${clienteId}/opportunities`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["oportunidades", clienteId] }),
  });
}

export function useUpdateOportunidadeStatus(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusOportunidade }) =>
      apiClient.put<Oportunidade>(`/opportunities/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["oportunidades", clienteId] }),
  });
}

export function useUpdateOportunidade(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OportunidadeUpdateInput }) =>
      apiClient.put<Oportunidade>(`/opportunities/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["oportunidades", clienteId] }),
  });
}

export function useDeleteOportunidade(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/opportunities/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["oportunidades", clienteId] }),
  });
}
