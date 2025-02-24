import { useQuery } from "@tanstack/react-query";
import type { Schedule } from "@/types/route.types";

export function useSchedules() {
  return useQuery<Schedule[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const response = await fetch("/api/schedules");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error fetching schedules");
      }
      const data = await response.json();
      return data;
    },
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