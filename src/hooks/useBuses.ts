import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Bus, CreateBusInput, UpdateBusInput } from "@/types/bus.types";

const API_URL = "/api/buses";

export function useBuses(companyId: string) {
  return useQuery({
    queryKey: ["buses", companyId],
    queryFn: async () => {
      const response = await fetch(`/api/buses?companyId=${companyId}`);
      if (!response.ok) {
        throw new Error("Error fetching buses");
      }
      return response.json() as Promise<Bus[]>;
    },
  });
}

export function useBus(busId: string) {
  return useQuery<Bus>({
    queryKey: ["buses", busId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${busId}`);
      return data;
    },
    enabled: !!busId,
  });
}

export function useCreateBus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBusInput) => {
      const response = await axios.post(API_URL, data);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || "Error al crear el bus");
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export function useUpdateBus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBusInput }) => {
      const response = await axios.patch(`${API_URL}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export function useDeleteBus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (busId: string) => {
      const response = await axios.delete(`${API_URL}/${busId}`);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || "Error al desactivar el bus");
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
} 