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