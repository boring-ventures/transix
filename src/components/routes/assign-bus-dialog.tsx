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
import { AlertCircle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import type { Bus } from "@/types/bus.types";
import type { Route, Schedule } from "@/types/route.types";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { isAfter, isBefore, setHours, setMinutes } from "date-fns";

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
  const [selectedBusId, setSelectedBusId] = useState("");
  const { toast } = useToast();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedBusId("");
    }
  }, [open]);

  // Filter available buses
  const availableBuses = useMemo(() => {
    return buses.filter(bus => {
      // Check if bus is active and not in maintenance
      if (!bus.isActive || bus.maintenanceStatus !== 'active') {
        return false;
      }

      // Check existing assignments for this bus
      const hasConflictingAssignment = bus.assignments?.some(assignment => {
        if (assignment.status !== 'active') return false;

        const assignmentStart = new Date(assignment.startTime);
        const assignmentEnd = new Date(assignment.endTime);
        const scheduleDate = new Date(schedule.departureDate);
        
        // Create datetime objects for comparison
        const newStartTime = selectedBusId ? setMinutes(
          setHours(scheduleDate, Number.parseInt(selectedBusId.split(':')[0])),
          Number.parseInt(selectedBusId.split(':')[1])
        ) : scheduleDate;

        const newEndTime = schedule.estimatedArrivalTime 
          ? new Date(schedule.estimatedArrivalTime)
          : new Date(scheduleDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours by default

        // Check for overlap
        return (
          (isAfter(newStartTime, assignmentStart) && isBefore(newStartTime, assignmentEnd)) ||
          (isAfter(newEndTime, assignmentStart) && isBefore(newEndTime, assignmentEnd)) ||
          (isBefore(newStartTime, assignmentStart) && isAfter(newEndTime, assignmentEnd))
        );
      });

      return !hasConflictingAssignment;
    });
  }, [buses, schedule, selectedBusId]);

  const handleSubmit = async () => {
    if (!selectedBusId) {
      toast({
        title: "Error de validación",
        description: "Debe seleccionar un bus",
        variant: "destructive",
      });
      return;
    }

    const startTime = new Date(schedule.departureDate);
    const endTime = schedule.estimatedArrivalTime 
      ? new Date(schedule.estimatedArrivalTime)
      : new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours by default

    try {
      await onAssign({
        busId: selectedBusId,
        scheduleId: schedule.id,
        routeId: schedule.routeId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      onOpenChange(false);
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
            {availableBuses.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No hay buses disponibles</AlertTitle>
                <AlertDescription>
                  Todos los buses están asignados o en mantenimiento para este horario.
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedBusId}
                onValueChange={setSelectedBusId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="bus">
                  <SelectValue placeholder="Selecciona un bus" />
                </SelectTrigger>
                <SelectContent>
                  {availableBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.plateNumber} - {bus.template?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedBusId("");
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedBusId || isSubmitting || availableBuses.length === 0}
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
