import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertCharge } from "@shared/schema";

export function useCharges(projectId?: number, taskId?: number) {
  return useQuery({
    queryKey: [api.charges.list.path, { projectId, taskId }],
    queryFn: async () => {
      const url = new URL(api.charges.list.path, window.location.origin);
      if (projectId) url.searchParams.append("projectId", projectId.toString());
      if (taskId) url.searchParams.append("taskId", taskId.toString());
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch charges");
      return api.charges.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCharge) => {
      const res = await fetch(api.charges.create.path, {
        method: api.charges.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create charge");
      return api.charges.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.charges.list.path] }),
  });
}

export function useUpdateCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertCharge> & { id: number }) => {
      const url = buildUrl(api.charges.update.path, { id });
      const res = await fetch(url, {
        method: api.charges.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update charge");
      return api.charges.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.charges.list.path] }),
  });
}

export function useDeleteCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.charges.delete.path, { id });
      const res = await fetch(url, {
        method: api.charges.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete charge");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.charges.list.path] }),
  });
}
