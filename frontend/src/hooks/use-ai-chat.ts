import { useMutation } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { ChatRequest, ChatResponse } from "../lib/types";

export function useSendChatMessage() {
  return useMutation({
    mutationFn: (data: ChatRequest) => apiClient.post<ChatResponse>("/ai/chat", data),
  });
}
