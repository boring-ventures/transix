import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { Schedule } from "@/types/route.types";
import { Bus } from "@/types/bus.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AssignBusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule;
  availableBuses: Bus[];
  onAssign: (busId: string) => Promise<void>;
}

export function AssignBusDialog({
  open,
  onOpenChange,
  schedule,
  availableBuses,
  onAssign,
}: AssignBusDialogProps) {
  const { toast } = useToast();
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    if (!selectedBusId) {
      toast({
        title: "Error",
        description: "Por favor seleccione un bus",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onAssign(selectedBusId);
      toast({
        title: "Bus asignado",
        description: "El bus ha sido asignado exitosamente al viaje",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al asignar bus",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Bus</DialogTitle>
          <DialogDescription>
            Seleccione un bus para asignar al viaje programado para el{" "}
            {format(new Date(schedule.departureDate), "EEEE d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
            {" a las "}
            {format(new Date(schedule.departureDate), "HH:mm", {
              locale: es,
            })}
            {" horas"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Select
            value={selectedBusId}
            onValueChange={setSelectedBusId}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un bus" />
            </SelectTrigger>
            <SelectContent>
              {availableBuses.map((bus) => (
                <SelectItem key={bus.id} value={bus.id}>
                  {bus.plateNumber} - {bus.template?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={!selectedBusId || isSubmitting}>
            {isSubmitting ? "Asignando..." : "Asignar Bus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 