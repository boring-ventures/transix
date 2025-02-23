import { useQuery } from "@tanstack/react-query";
import type { Schedule } from "@/types/route.types";

export function useSchedules(scheduleId?: string) {
  return useQuery<Schedule[]>({
    queryKey: ["schedules", scheduleId],
    queryFn: async () => {
      const url = scheduleId 
        ? `/api/schedules/${scheduleId}`
        : '/api/schedules';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al obtener los horarios");
      }
      return response.json();
    },
    enabled: true,
  });
}

export function useRouteSchedules(routeId: string | undefined) {
  return useQuery({
    queryKey: ["schedules", routeId],
    queryFn: async () => {
      if (!routeId) return [];
      const response = await fetch(`/api/schedules?routeId=${routeId}`);
      if (!response.ok) throw new Error("Error fetching schedules");
      return response.json();
    },
    enabled: !!routeId
  });
}

async function getSchedulesByRouteSchedule(routeScheduleId: string | undefined) {
  if (!routeScheduleId) return [];
  
  const response = await fetch(`/api/schedules?routeScheduleId=${routeScheduleId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }
  return response.json();
}

export function useSchedulesByRouteSchedule(routeScheduleId: string | undefined) {
  return useQuery<Schedule[]>({
    queryKey: ["schedules", "by-route-schedule", routeScheduleId],
    queryFn: () => getSchedulesByRouteSchedule(routeScheduleId),
    enabled: !!routeScheduleId,
  });
} 