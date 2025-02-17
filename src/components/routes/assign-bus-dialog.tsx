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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AssignBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: Route;
  schedule: Schedule;
  buses: Bus[];
  onAssign: (data: { 
    busId: string; 
    scheduleId: string;
    routeId: string;
    startTime: string;
    endTime: string;
  }) => Promise<void>;
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
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const { toast } = useToast();

  const handleAssign = async () => {
    if (!selectedBus) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar un bus",
        variant: "destructive",
      });
      return;
    }

    if (!startTime) {
      toast({
        title: "Error de validación",
        description: "Debe especificar la hora de inicio",
        variant: "destructive",
      });
      return;
    }

    if (!endTime) {
      toast({
        title: "Error de validación",
        description: "Debe especificar la hora de fin",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Enviando datos de asignación:", {
        busId: selectedBus,
        scheduleId: schedule.id,
        routeId: schedule.routeId,
        startTime,
        endTime
      });

      await onAssign({ 
        busId: selectedBus,
        scheduleId: schedule.id,
        routeId: schedule.routeId,
        startTime,
        endTime
      });
      onOpenChange(false);
      setSelectedBus(undefined);
      setStartTime("");
      setEndTime("");
    } catch (error) {
      console.error("Error al asignar bus:", error);
      toast({
        title: "Error al asignar bus",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
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
                {buses.map((bus: Bus) => (
                  <SelectItem key={bus.id} value={bus.id}>
                    {bus.plateNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startTime">Hora de Inicio</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endTime">Hora de Fin</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
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
            disabled={!selectedBus || !startTime || !endTime || isSubmitting}
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
