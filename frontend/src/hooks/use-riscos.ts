import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type {
  Risco,
  RiscoCreateInput,
  RiscoResumo,
  RiscoUpdateInput,
  StatusRisco,
} from "../lib/types";

export function useRiscos(clienteId: string) {
  return useQuery({
    queryKey: ["riscos", clienteId],
    queryFn: () => apiClient.get<Risco[]>(`/clients/${clienteId}/risks`),
  });
}

/** Riscos abertos de toda a carteira (clientes ativos), usado na página Riscos. */
export function useRiscosCarteira() {
  return useQuery({
    queryKey: ["riscos-carteira"],
    queryFn: () => apiClient.get<RiscoResumo[]>("/risks"),
  });
}

export function useCreateRisco(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RiscoCreateInput) =>
      apiClient.post<Risco>(`/clients/${clienteId}/risks`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["riscos", clienteId] }),
  });
}

export function useUpdateRiscoStatus(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusRisco }) =>
      apiClient.put<Risco>(`/risks/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["riscos", clienteId] }),
  });
}

export function useUpdateRisco(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RiscoUpdateInput }) =>
      apiClient.put<Risco>(`/risks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["riscos", clienteId] }),
  });
}

export function useDeleteRisco(clienteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/risks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["riscos", clienteId] }),
  });
}
