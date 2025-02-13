import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusAvailabilityCheck } from "./BusAvailabilityCheck";
import { useBusAvailability } from "@/hooks/useBusAvailability";
import { z } from "zod";
import { Bus } from "@/types/bus.types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const assignmentSchema = z.object({
  busId: z.string().uuid(),
  startTime: z.string(),
  endTime: z.string(),
});

interface BusAssignmentFormProps {
  routeId: string;
  onSubmit: (data: z.infer<typeof assignmentSchema>) => void;
  buses: Bus[];
  isLoading?: boolean;
}

export function BusAssignmentForm({ 
  routeId, 
  onSubmit,
  buses,
  isLoading = false
}: BusAssignmentFormProps) {
  const [selectedBus, setSelectedBus] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const form = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      busId: "",
      startTime: "",
      endTime: "",
    }
  });

  const { data: busAvailabilityData } = useBusAvailability(
    selectedBus,
    startTime ? new Date(startTime) : new Date(),
    startTime?.split('T')[1]?.slice(0, 5) || "",
    endTime?.split('T')[1]?.slice(0, 5) || ""
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <Select
          value={selectedBus}
          onValueChange={setSelectedBus}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar bus" />
          </SelectTrigger>
          <SelectContent>
            {buses.map((bus) => (
              <SelectItem key={bus.id} value={bus.id}>
                {bus.plateNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Time Inputs */}
        <Input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
        <Input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        {/* Bus Availability Check */}
        {selectedBus && startTime && endTime && (
          <BusAvailabilityCheck
            busId={selectedBus}
            departureDate={new Date(startTime)}
            departureTime={startTime.split('T')[1].slice(0, 5)}
            arrivalTime={endTime.split('T')[1].slice(0, 5)}
          />
        )}

        <Button 
          type="submit"
          disabled={
            !form.formState.isValid || 
            !selectedBus || 
            !startTime || 
            !endTime || 
            !busAvailabilityData?.isAvailable
          }
        >
          Assign Bus
        </Button>
      </div>
    </form>
  );
}