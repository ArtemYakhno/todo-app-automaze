import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toErrorMessage } from "./apiClient";

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(toErrorMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 60_000,
      gcTime: 5 * 60_000,
    },
  },
});
