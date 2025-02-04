import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SeatTier, SeatPosition } from "@/types/bus.types";
import { getTierColor } from "@/lib/seat-tier-colors";

interface EditTemplateSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: SeatPosition;
  seatTiers: SeatTier[];
  onUpdate: (seatId: string, updates: Partial<SeatPosition>) => void;
}

export const EditTemplateSeatModal = ({
  isOpen,
  onClose,
  seat,
  seatTiers,
  onUpdate,
}: EditTemplateSeatModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Asiento {seat.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Estado</Label>
            <Select
              value={seat.isEmpty ? "empty" : "active"}
              onValueChange={(value) =>
                onUpdate(seat.id, {
                  isEmpty: value === "empty",
                  tierId: value === "empty" ? "" : seat.tierId,
                })
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="empty">Espacio Vacío</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!seat.isEmpty && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Nivel</Label>
              <Select
                value={seat.tierId || ""}
                onValueChange={(value) =>
                  onUpdate(seat.id, {
                    tierId: value,
                  })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {seatTiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
