import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertHabit } from "@shared/schema";
import { auth } from "@/lib/firebase";

export function useHabits() {
  return useQuery({
    queryKey: [api.habits.list.path],
    queryFn: async () => {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(api.habits.list.path, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      if (!res.ok) throw new Error("Failed to fetch habits");
      return api.habits.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHabit) => {
      const token = await auth.currentUser?.getIdToken();
      const validated = api.habits.create.input.parse(data);
      const res = await fetch(api.habits.create.path, {
        method: api.habits.create.method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) throw new Error("Failed to create habit");
      return api.habits.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.habits.list.path] }),
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const token = await auth.currentUser?.getIdToken();
      const url = buildUrl(api.habits.delete.path, { id });
      const res = await fetch(url, { 
        method: api.habits.delete.method,
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      if (!res.ok) throw new Error("Failed to delete habit");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.habits.list.path] }),
  });
}

export function useLogHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date }: { id: number; date: string }) => {
      const token = await auth.currentUser?.getIdToken();
      const url = buildUrl(api.habits.log.path, { id });
      const res = await fetch(url, {
        method: api.habits.log.method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ date }),
      });

      if (!res.ok) throw new Error("Failed to log habit");
      return api.habits.log.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.habits.list.path] }),
  });
}
