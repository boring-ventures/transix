import { useBusAvailability } from "@/hooks/useBusAvailability";
import { Alert } from "@/components/ui/alert";

interface BusAvailabilityCheckProps {
  busId: string;
  departureDate: Date;
  departureTime: string;
  arrivalTime: string;
  excludeScheduleId?: string;
}

export function BusAvailabilityCheck({
  busId,
  departureDate,
  departureTime,
  arrivalTime,
  excludeScheduleId,
}: BusAvailabilityCheckProps) {
  const { data, isLoading, error } = useBusAvailability(
    busId,
    departureDate,
    departureTime,
    arrivalTime,
    excludeScheduleId
  );

  if (isLoading || error || data?.isAvailable) return null;

  return (
    <Alert variant="destructive" className="mt-2">
      El bus ya está asignado a otra ruta en este horario
    </Alert>
  );
} 