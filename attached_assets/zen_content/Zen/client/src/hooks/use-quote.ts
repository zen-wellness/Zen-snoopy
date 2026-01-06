import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useQuote() {
  return useQuery({
    queryKey: [api.quotes.random.path],
    queryFn: async () => {
      const res = await fetch(api.quotes.random.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch quote");
      return api.quotes.random.responses[200].parse(await res.json());
    },
    staleTime: 1000 * 60 * 60, // 1 hour - don't fetch new quote constantly
  });
}
