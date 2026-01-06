import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type JournalEntry, type CreateJournalEntryRequest } from "@shared/schema";

export function useJournal(date?: string) {
  return useQuery({
    queryKey: [api.journal.list.path, date],
    queryFn: async () => {
      let url = api.journal.list.path;
      if (date) url += `?date=${date}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch journal entries");
      return api.journal.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateJournalEntryRequest) => {
      const res = await fetch(api.journal.create.path, {
        method: api.journal.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create journal entry");
      return api.journal.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.journal.list.path, variables.date] });
    },
  });
}
