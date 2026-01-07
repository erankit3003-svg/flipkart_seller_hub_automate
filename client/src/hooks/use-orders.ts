import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useOrders(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: [api.orders.list.path, filters],
    queryFn: async () => {
      const url = filters
        ? `${api.orders.list.path}?${new URLSearchParams(filters as Record<string, string>)}`
        : api.orders.list.path;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [api.orders.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.orders.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch order");
      return api.orders.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSyncOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.orders.sync.path, {
        method: api.orders.sync.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to sync orders");
      return api.orders.sync.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      toast({ title: "Sync Complete", description: data.message });
    },
    onError: (err) => {
      toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
    },
  });
}

export function useGenerateInvoice() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.orders.generateInvoice.path, { id });
      const res = await fetch(url, {
        method: api.orders.generateInvoice.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate invoice");
      return api.orders.generateInvoice.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      window.open(data.url, "_blank");
      toast({ title: "Invoice Generated", description: "Invoice opened in new tab" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
