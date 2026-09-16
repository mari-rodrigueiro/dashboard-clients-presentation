import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { GP } from "../lib/types";

export function useGPs() {
  return useQuery({
    queryKey: ["gps"],
    queryFn: () => apiClient.get<GP[]>("/gps"),
  });
}

export function useCreateGP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => apiClient.post<GP>("/gps", { nome }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gps"] }),
  });
}
