import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BusSeat, SeatTier } from "@/types/bus.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { useUpdateSeatStatus } from "@/hooks/useBusSeats";
import { Badge } from "@/components/ui/badge";
import { useSeatTiers } from "@/hooks/useSeatTiers";

interface EditSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: BusSeat;
  seatTier?: SeatTier;
}

export const EditSeatModal = ({
  isOpen,
  onClose,
  seat,
  seatTier,
}: EditSeatModalProps) => {
  const { toast } = useToast();
  const updateSeat = useUpdateSeatStatus();
  const { data: seatTiers } = useSeatTiers();

  const handleStatusChange = async (status: string) => {
    try {
      console.log("Updating seat status:", { seatId: seat.id, status });
      await updateSeat.mutateAsync({
        seatId: seat.id,
        status,
      });
      toast({
        title: "Asiento actualizado",
        description: "El estado del asiento ha sido actualizado exitosamente.",
      });
      onClose();
    } catch (error) {
      console.error("Error updating seat status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al actualizar el asiento.",
        variant: "destructive",
      });
    }
  };

  const handleTierChange = async (tierId: string) => {
    try {
      console.log("Updating seat tier:", { seatId: seat.id, tierId });
      await updateSeat.mutateAsync({
        seatId: seat.id,
        tierId,
      });
      toast({
        title: "Asiento actualizado",
        description: "El nivel del asiento ha sido actualizado exitosamente.",
      });
      onClose();
    } catch (error) {
      console.error("Error updating seat tier:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al actualizar el asiento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Asiento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Información del Asiento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Número</span>
                <p className="text-sm font-medium">{seat.seatNumber}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge
                  variant="outline"
                  className={
                    seat.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                      : seat.status === "available"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                >
                  {seat.status === "maintenance"
                    ? "Mantenimiento"
                    : seat.status === "available"
                    ? "Disponible"
                    : "Deshabilitado"}
                </Badge>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-muted-foreground">Nivel</span>
                <p className="text-sm font-medium">
                  {seatTier?.name || "Sin nivel"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                defaultValue={seat.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="disabled">Deshabilitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel</label>
              <Select
                key={seat.id}
                value={seat.tierId}
                onValueChange={handleTierChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {seatTiers?.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} - ${parseFloat(tier.basePrice.toString()).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
