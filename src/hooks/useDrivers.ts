import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Driver, CreateDriverInput, UpdateDriverInput } from "@/types/driver.types";

export function useDrivers(companyId?: string) {
  return useQuery<Driver[]>({
    queryKey: ["drivers", companyId],
    queryFn: async () => {
      const url = companyId ? `/api/drivers?companyId=${companyId}` : "/api/drivers";
      const response = await fetch(url);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error fetching drivers");
      }
      return response.json();
    },
    enabled: true,
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error creating driver");
      }

      const result = await response.json();
      console.log("Driver created successfully:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
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
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error updating driver");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/drivers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error deleting driver");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    },
  });
} 