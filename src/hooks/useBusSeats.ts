import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BusSeat, UpdateBusSeatInput } from "@/types/bus.types";

interface UpdateSeatStatusInput {
  seatId: string;
  status?: string;
  tierId?: string;
}

interface BulkUpdateSeatsInput {
  seatIds: string[];
  data: UpdateBusSeatInput;
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
    enabled: !!busId,
  });
}

export function useUpdateSeatStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ seatId, status, tierId }: UpdateSeatStatusInput) => {
      const response = await fetch(`/api/bus-seats/${seatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, tierId }),
      });

      if (!response.ok) {
        console.log(response)
        throw new Error("Error al actualizar el asiento");
      }

      return response.json() as Promise<BusSeat>;
    },
    onSuccess: async (data) => {
      // Invalidar la query de los asientos del bus
      queryClient.invalidateQueries({
        queryKey: ["bus-seats", data.busId],
      });
      
      // Invalidar la query del bus para actualizar el SeatMatrixPreview
      queryClient.invalidateQueries({
        queryKey: ["buses", data.busId],
      });
      
      // Invalidar la query general de buses
      queryClient.invalidateQueries({
        queryKey: ["buses"],
      });
    },
  });
}

export function useBulkUpdateSeats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ seatIds, data }: BulkUpdateSeatsInput) => {
      const response = await fetch(`/api/bus-seats`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seatIds, data }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar los asientos");
      }

      return response.json() as Promise<BusSeat[]>;
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({
          queryKey: ["bus-seats", data[0].busId],
        });
      }
    },
  });
} 