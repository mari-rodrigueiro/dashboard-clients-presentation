import { useQuery } from "@tanstack/react-query";

import { apiClient } from "../lib/api-client";
import type { DashboardStats } from "../lib/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => apiClient.get<DashboardStats>("/dashboard"),
  });
}
