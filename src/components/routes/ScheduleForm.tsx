import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateRouteScheduleInput,
  createRouteScheduleSchema,
} from "@/types/route.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusAvailabilityCheck } from "./BusAvailabilityCheck";
import { calculateArrivalTime } from "@/lib/routes/validation";
import { useRoute } from "@/hooks/useRoutes";
import { useBusAvailability } from "@/hooks/useBusAvailability";

export function ScheduleForm({
  routeId,
  onSubmit,
}: {
  routeId: string;
  onSubmit: (data: CreateRouteScheduleInput) => void;
}) {
  const [selectedBus, setSelectedBus] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>();
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  const { data: route } = useRoute(routeId);

  const form = useForm<CreateRouteScheduleInput>({
    resolver: zodResolver(createRouteScheduleSchema),
  });

  const handleDepartureTimeChange = (time: string) => {
    setDepartureTime(time);
    // Calculate arrival time based on route duration
    if (route?.estimatedDuration) {
      const calculatedArrivalTime = calculateArrivalTime(
        time,
        route.estimatedDuration
      );
      setArrivalTime(calculatedArrivalTime);
    }
  };

  const { data: busAvailabilityData } = useBusAvailability(
    selectedBus,
    departureDate || new Date(), // Provide default Date if undefined
    departureTime,
    arrivalTime
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        {/* Bus Selection */}
        <select
          value={selectedBus}
          onChange={(e) => setSelectedBus(e.target.value)}
        >
          {/* Bus options */}
        </select>

        {/* Date and Time Inputs */}
        <Input
          type="date"
          value={departureDate?.toISOString().split("T")[0]}
          onChange={(e) => setDepartureDate(new Date(e.target.value))}
        />
        <Input
          type="time"
          value={departureTime}
          onChange={(e) => handleDepartureTimeChange(e.target.value)}
        />

        {/* Show calculated arrival time */}
        <div>
          <label>Arrival Time:</label>
          <span>{arrivalTime}</span>
        </div>

        {/* Bus Availability Check */}
        {selectedBus && departureDate && departureTime && arrivalTime && (
          <BusAvailabilityCheck
            busId={selectedBus}
            departureDate={departureDate}
            departureTime={departureTime}
            arrivalTime={arrivalTime}
          />
        )}

        <Button
          type="submit"
          disabled={
            !form.formState.isValid ||
            !selectedBus ||
            !departureDate ||
            !departureTime ||
            !arrivalTime ||
            !busAvailabilityData?.isAvailable
          }
        >
          Create Schedule
        </Button>
      </div>
    </form>
  );
}