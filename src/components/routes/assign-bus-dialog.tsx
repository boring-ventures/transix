import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { Bus } from "@/types/bus.types";
import { Route, Schedule } from "@/types/route.types";
import { useBusAvailability } from "@/hooks/useBusAvailability";
import { Label } from "@/components/ui/label";

interface AssignBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: Route;
  schedule?: Schedule;
  buses: Bus[];
  onAssign: (data: { busId: string; scheduleId: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function AssignBusDialog({
  open,
  onOpenChange,
  route,
  schedule,
  buses,
  onAssign,
  isSubmitting = false
}: AssignBusDialogProps) {
  const [selectedBus, setSelectedBus] = useState<string | undefined>(undefined);

  const handleAssign = async () => {
    if (!selectedBus) return;
    await onAssign({ 
      busId: selectedBus, 
      scheduleId: schedule?.id || route?.id || ""
    });
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    if (schedule) {
      return "Asignar Bus a Horario";
    }
    return "Asignar Bus a Ruta";
  };

  const getDialogDescription = () => {
    if (schedule) {
      const departureDateTime = new Date(schedule.departureDate);
      const estimatedArrival = new Date(schedule.estimatedArrivalTime);
      return `Horario: ${formatTime(departureDateTime)} - ${formatTime(estimatedArrival)}`;
    }
    return `Selecciona un bus para asignar a la ruta ${route?.name}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bus">Bus</Label>
            <Select
              value={selectedBus}
              onValueChange={setSelectedBus}
            >
              <SelectTrigger id="bus">
                <SelectValue placeholder="Selecciona un bus" />
              </SelectTrigger>
              <SelectContent>
                {buses.map((bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.plateNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedBus || isSubmitting}
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
