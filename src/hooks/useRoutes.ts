import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { 
  RouteWithRelations, 
  RouteSchedule,
  CreateRouteInput, 
  UpdateRouteInput,
  CreateRouteScheduleInput,
  UpdateRouteScheduleInput 
} from "@/types/route.types";

const ROUTES_API_URL = "/api/routes";
const ROUTE_SCHEDULES_API_URL = "/api/route-schedules";

export function useRoutes() {
  return useQuery<RouteWithRelations[]>({
    queryKey: ["routes"],
    queryFn: async () => {
      const response = await fetch(ROUTES_API_URL);
      if (!response.ok) {
        throw new Error("Error fetching routes");
      }
      return response.json();
    },
  });
}

export function useRoute(routeId: string) {
  return useQuery<RouteWithRelations>({
    queryKey: ["routes", routeId],
    queryFn: async () => {
      const { data } = await axios.get(`${ROUTES_API_URL}/${routeId}`);
      return data;
    },
    enabled: !!routeId,
  });
}

export const useRouteSchedules = (routeId?: string) => {
  return useQuery<RouteSchedule[]>({
    queryKey: ["route-schedules", routeId],
    queryFn: async () => {
      const { data } = await axios.get<RouteSchedule[]>(
        routeId
          ? `/api/route-schedules?routeId=${routeId}`
          : "/api/route-schedules"
      );
      return data;
    },
    enabled: !!routeId,
  });
};

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRouteInput) => {
      const { data: response } = await axios.post(ROUTES_API_URL, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}

export function useCreateRouteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRouteScheduleInput) => {
      const { data: response } = await axios.post(ROUTE_SCHEDULES_API_URL, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-schedules"] });
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
      const { data: response } = await axios.patch(
        `${ROUTES_API_URL}/${routeId}`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["routes", variables.routeId] });
    },
  });
}

export function useUpdateRouteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      scheduleId,
      data,
    }: {
      scheduleId: string;
      data: UpdateRouteScheduleInput;
    }) => {
      const { data: response } = await axios.patch(
        `${ROUTE_SCHEDULES_API_URL}/${scheduleId}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId: string) => {
      const { data } = await axios.delete(`${ROUTES_API_URL}/${routeId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}

export function useDeleteRouteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data } = await axios.delete(`${ROUTE_SCHEDULES_API_URL}/${scheduleId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["route-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["routes"] });
    },
  });
}
