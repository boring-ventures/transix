import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { SeatTier, CreateSeatTierInput } from "@/types/bus.types";

const API_URL = "/api/seat-tiers";

export function useSeatTiers() {
  return useQuery<SeatTier[]>({
    queryKey: ["seatTiers"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return data;
    },
  });
}

export function useCreateSeatTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSeatTierInput) => {
      const response = await axios.post(API_URL, data);
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seatTiers"] });
    },
  });
} 