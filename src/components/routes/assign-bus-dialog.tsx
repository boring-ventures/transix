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
import { Bus } from "@/types/bus.types";
import { Route, Schedule } from "@/types/route.types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { addMinutes, format, isAfter, isBefore, setHours, setMinutes } from "date-fns";

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

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedBus(undefined);
      // Set default start time to schedule departure time
      const defaultStartTime = format(new Date(schedule.departureDate), "HH:mm");
      setStartTime(defaultStartTime);
      // Set default end time to estimated arrival
      const defaultEndTime = format(new Date(schedule.estimatedArrivalTime), "HH:mm");
      setEndTime(defaultEndTime);
    }
  }, [open, schedule]);

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
        const newStartTime = startTime ? setMinutes(
          setHours(scheduleDate, parseInt(startTime.split(':')[0])),
          parseInt(startTime.split(':')[1])
        ) : scheduleDate;

        const newEndTime = endTime ? setMinutes(
          setHours(scheduleDate, parseInt(endTime.split(':')[0])),
          parseInt(endTime.split(':')[1])
        ) : addMinutes(
          scheduleDate, 
          route?.estimatedDuration || 0
        );

        // Check for overlap
        return (
          (isAfter(newStartTime, assignmentStart) && isBefore(newStartTime, assignmentEnd)) ||
          (isAfter(newEndTime, assignmentStart) && isBefore(newEndTime, assignmentEnd)) ||
          (isBefore(newStartTime, assignmentStart) && isAfter(newEndTime, assignmentEnd))
        );
      });

      return !hasConflictingAssignment;
    });
  }, [buses, schedule, startTime, endTime, route]);

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

    // Validate time range
    const scheduleDate = new Date(schedule.departureDate);
    const startDateTime = new Date(scheduleDate);
    startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0);
    
    const endDateTime = new Date(scheduleDate);
    endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0);

    if (isAfter(startDateTime, endDateTime)) {
      toast({
        title: "Error de validación",
        description: "La hora de inicio debe ser anterior a la hora de fin",
        variant: "destructive",
      });
      return;
    }

    try {
      await onAssign({ 
        busId: selectedBus,
        scheduleId: schedule.id,
        routeId: schedule.routeId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
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
                value={selectedBus}
                onValueChange={setSelectedBus}
              >
                <SelectTrigger id="bus">
                  <SelectValue placeholder="Selecciona un bus" />
                </SelectTrigger>
                <SelectContent>
                  {availableBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.plateNumber} ({bus.template?.name || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            disabled={!selectedBus || !startTime || !endTime || isSubmitting || availableBuses.length === 0}
          >
            {isSubmitting ? "Asignando..." : "Asignar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
