import { useQuery } from "@tanstack/react-query";

export function useBusAvailability(
  busId: string | undefined | null,
  departureDate: Date | undefined | null,
  departureTime: string | undefined | null,
  arrivalTime: string | undefined | null
) {
  return useQuery({
    queryKey: ['busAvailability', busId, departureDate?.toISOString(), departureTime, arrivalTime],
    queryFn: async () => {
      if (!busId || !departureDate || !departureTime || !arrivalTime) {
        return { isAvailable: false };
      }

      const response = await fetch(`/api/bus-availability?${new URLSearchParams({
        busId,
        departureDate: departureDate.toISOString(),
        departureTime,
        arrivalTime,
      })}`);
      
      if (!response.ok) {
        throw new Error('Failed to check bus availability');
      }
      
      return response.json();
    },
    enabled: !!busId && !!departureDate && !!departureTime && !!arrivalTime,
    staleTime: Infinity,         // Los datos nunca se consideran obsoletos
    gcTime: 60000,              // Cache por 1 minuto
    refetchOnWindowFocus: false, // No recargar al cambiar de ventana
    refetchOnMount: false,      // No recargar al montar
    refetchOnReconnect: false,  // No recargar al reconectar
    retry: false,               // No reintentar en caso de error
  });
} 