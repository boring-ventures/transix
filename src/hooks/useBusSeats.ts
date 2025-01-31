import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BusSeat } from "@/types/bus.types";

interface UpdateSeatStatusInput {
  seatId: string;
  status: string;
}

export function useBusSeats(busId: string) {
  return useQuery({
    queryKey: ["bus-seats", busId],
    queryFn: async () => {
      const response = await fetch(`/api/buses/${busId}/seats`);
      if (!response.ok) {
        throw new Error("Error al obtener los asientos del bus");
      }
      return response.json() as Promise<BusSeat[]>;
    },
  });
}

export function useUpdateSeatStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ seatId, status }: UpdateSeatStatusInput) => {
      const response = await fetch(`/api/bus-seats/${seatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado del asiento");
      }

      return response.json() as Promise<BusSeat>;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bus-seats", data.busId],
      });
    },
  });
} 