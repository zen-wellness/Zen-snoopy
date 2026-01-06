import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertJournalEntry } from "@shared/schema";
import { auth } from "@/lib/firebase";

export function useJournalEntries(date?: string) {
  return useQuery({
    queryKey: [api.journal.list.path, date],
    queryFn: async () => {
      const token = await auth.currentUser?.getIdToken();
      const url = date 
        ? `${api.journal.list.path}?date=${date}`
        : api.journal.list.path;
      
      const res = await fetch(url, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      if (!res.ok) throw new Error("Failed to fetch journal entries");
      const data = await res.json();
      return api.journal.list.responses[200].parse(data);
    },
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertJournalEntry, "userId">) => {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(api.journal.create.path, {
        method: api.journal.create.method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error("Failed to save journal entry");
      return api.journal.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.journal.list.path] }),
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await auth.currentUser?.getIdToken();
      const url = buildUrl(api.journal.delete.path, { id });
      const res = await fetch(url, { 
        method: api.journal.delete.method,
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      if (!res.ok) throw new Error("Failed to delete entry");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.journal.list.path] }),
  });
}
