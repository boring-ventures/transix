import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SeatTier, CreateSeatTierInput, UpdateSeatTierInput } from "@/types/bus.types";

const SEAT_TIERS_KEY = "seat-tiers";

async function fetchSeatTiers(): Promise<SeatTier[]> {
  const response = await fetch("/api/seat-tiers");
  if (!response.ok) {
    throw new Error("Error fetching seat tiers");
  }
  return response.json();
}

async function createSeatTier(data: CreateSeatTierInput): Promise<SeatTier> {
  const response = await fetch("/api/seat-tiers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error creating seat tier");
  }

  return response.json();
}

async function updateSeatTier(data: UpdateSeatTierInput & { id: string }): Promise<SeatTier> {
  const response = await fetch(`/api/seat-tiers/${data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error updating seat tier");
  }

  return response.json();
}

export function useSeatTiers() {
  return useQuery<SeatTier[]>({
    queryKey: [SEAT_TIERS_KEY],
    queryFn: fetchSeatTiers,
  });
}

export function useCreateSeatTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSeatTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SEAT_TIERS_KEY] });
    },
  });
}

export function useUpdateSeatTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSeatTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SEAT_TIERS_KEY] });
    },
  });
} 