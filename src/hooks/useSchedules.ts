import { useQuery } from "@tanstack/react-query";

async function fetchSchedules() {
  const response = await fetch("/api/schedules");
  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }
  return response.json();
}

export function useSchedules() {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules
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