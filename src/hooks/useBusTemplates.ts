import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { BusTypeTemplate, CreateBusTypeTemplateInput } from "@/types/bus.types";

const API_URL = "/api/bus-templates";

export function useBusTemplates() {
  return useQuery<BusTypeTemplate[]>({
    queryKey: ["busTemplates"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
  });
}

export function useBusTemplate(templateId: string) {
  return useQuery<BusTypeTemplate>({
    queryKey: ["busTemplates", templateId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${templateId}`);
      return data;
    },
    enabled: !!templateId,
  });
}

export function useCreateBusTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBusTypeTemplateInput) => {
      const response = await axios.post(API_URL, data);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || "Error al crear la plantilla");
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["busTemplates"] });
    },
  });
}

export function useUpdateBusTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBusTypeTemplateInput> }) => {
      const response = await axios.patch(`${API_URL}/${id}`, data);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || "Error al actualizar la plantilla");
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["busTemplates"] });
    },
  });
}

export function useDeleteBusTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await axios.patch(`${API_URL}/${templateId}`, { isActive: false });
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || "Error al desactivar la plantilla");
      }
      throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["busTemplates"] });
    },
  });
} 