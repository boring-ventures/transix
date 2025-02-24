import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Driver, CreateDriverInput, UpdateDriverInput } from "@/types/driver.types";

export function useDrivers(companyId?: string) {
  return useQuery<Driver[]>({
    queryKey: ["drivers", companyId],
    queryFn: async () => {
      const url = companyId 
        ? `/api/drivers?companyId=${encodeURIComponent(companyId)}`
        : '/api/drivers';
      
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al obtener los conductores");
      }
      return response.json();
    },
    enabled: !!companyId,
  });
}

export function useDriver(driverId: string) {
  return useQuery<Driver>({
    queryKey: ["drivers", driverId],
    queryFn: async () => {
      const response = await fetch(`/api/drivers/${driverId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al obtener el conductor");
      }
      return response.json();
    },
    enabled: !!driverId,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDriverInput) => {
      console.log("Creating driver with data:", data);
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear el conductor");
      }

      const result = await response.json();
      console.log("Driver created:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Mutation succeeded, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", data.companyId] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error);
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDriverInput }) => {
      const response = await fetch(`/api/drivers?id=${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar el conductor");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", data.companyId] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const response = await fetch(`/api/drivers?id=${driverId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar el conductor");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", data.companyId] });
    },
  });
} 