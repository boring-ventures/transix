import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Bus, BusWithRelations, CreateBusInput, UpdateBusInput } from "@/types/bus.types";

const API_URL = "/api/buses";

export function useBuses(companyId?: string) {
  return useQuery<BusWithRelations[]>({
    queryKey: ["buses", companyId],
    queryFn: async () => {
      const url = companyId 
        ? `/api/buses?companyId=${encodeURIComponent(companyId)}`
        : '/api/buses';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener los buses");
      }
      return response.json();
    },
    enabled: !!companyId,
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
      try {
        const response = await axios.post(API_URL, data);
        
        if (response.data.error) {
          throw new Error(
            response.data.details 
              ? `${response.data.error}: ${response.data.details}`
              : response.data.error
          );
        }
        
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorData = error.response?.data;
          let errorMessage = "Error al crear el bus";

          if (errorData) {
            if (errorData.details) {
              errorMessage = `${errorData.error}: ${errorData.details}`;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        throw error instanceof Error 
          ? error 
          : new Error("Error desconocido al crear el bus");
      }
    },
    onError: (error) => {
      console.error("Error in useCreateBus:", error);
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