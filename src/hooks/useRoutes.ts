import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Route, CreateRouteInput, UpdateRouteInput } from "@/types/route.types";

const API_URL = "/api/routes";

export function useRoutes(companyId?: string) {
  return useQuery<Route[]>({
    queryKey: ["routes", companyId],
    queryFn: async () => {
      const url = companyId ? `${API_URL}?companyId=${companyId}` : API_URL;
      const { data } = await axios.get(url);
      return data;
    },
  });
}

export function useRoute(routeId: string) {
  return useQuery<Route>({
    queryKey: ["routes", routeId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}?routeId=${routeId}`);
      return data;
    },
    enabled: !!routeId,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRouteInput) => {
      const { data: response } = await axios.post(API_URL, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      routeId,
      data,
    }: {
      routeId: string;
      data: UpdateRouteInput;
    }) => {
      const response = await axios.patch(API_URL, { routeId, data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId: string) => {
      const response = await axios.delete(`${API_URL}?routeId=${routeId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}
