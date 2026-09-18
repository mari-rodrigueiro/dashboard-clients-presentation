import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { Cliente, ClienteImportConfirmInput, ClienteImportPreview } from "../lib/types";

export function usePreviewImportCliente() {
  return useMutation({
    mutationFn: (conteudo_md: string) =>
      apiClient.post<ClienteImportPreview>("/clients/import-md/preview", { conteudo_md }),
  });
}

export function useConfirmImportCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteImportConfirmInput) =>
      apiClient.post<Cliente>("/clients/import-md/confirm", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clientes"] }),
  });
}
