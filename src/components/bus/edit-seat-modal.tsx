import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { seatStatusEnum } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useUpdateSeatStatus } from "@/hooks/useBusSeats";

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
  const updateSeatStatus = useUpdateSeatStatus();

  const handleStatusChange = async (status: string) => {
    try {
      await updateSeatStatus.mutateAsync({
        seatId: seat.id,
        status,
      });
      toast({
        title: "Estado actualizado",
        description: "El estado del asiento ha sido actualizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al actualizar el estado del asiento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Asiento {seat.seatNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">ID:</span>
                  <p className="text-sm font-mono">{seat.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Número:</span>
                  <p className="text-sm">{seat.seatNumber}</p>
                </div>
                {seatTier && (
                  <>
                    <div>
                      <span className="text-sm font-medium">Tipo:</span>
                      <p className="text-sm">{seatTier.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Precio Base:</span>
                      <p className="text-sm">
                        ${parseFloat(seatTier.basePrice).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <span className="text-sm font-medium">Estado:</span>
                  <Select
                    value={seat.status || "available"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {seatStatusEnum.enumValues.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "available"
                            ? "Disponible"
                            : "Mantenimiento"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
