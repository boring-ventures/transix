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
  schedule: Schedule;
  buses: Bus[];
  onAssign: (data: { busId: string; scheduleId: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function AssignBusDialog({
  open,
  onOpenChange,
  schedule,
  buses,
  onAssign,
  isSubmitting
}: AssignBusDialogProps) {
  const [selectedBus, setSelectedBus] = useState<string | undefined>(undefined);

  const handleAssign = async () => {
    if (!selectedBus) return;
    await onAssign({ 
      busId: selectedBus, 
      scheduleId: schedule.id 
    });
    onOpenChange(false);
  };

  // Formatear las fechas para mostrar
  const departureDateTime = new Date(schedule.departureDate);
  const estimatedArrival = new Date(schedule.estimatedArrivalTime);

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
          <DialogTitle>Asignar Bus a Ruta</DialogTitle>
          <DialogDescription>
            Horario: {formatTime(departureDateTime)} - {formatTime(estimatedArrival)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Bus</Label>
            <Select
              value={selectedBus}
              onValueChange={setSelectedBus}
              disabled={isSubmitting}
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
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedBus || isSubmitting}
          >
            {isSubmitting ? "Asignando..." : "Asignar Bus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
