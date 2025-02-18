import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateSeatTier, useUpdateSeatTier } from "@/hooks/useSeatTiers";
import {
  SeatTier,
  CreateSeatTierInput,
  UpdateSeatTierInput,
} from "@/types/bus.types";
import { cn } from "@/lib/utils";
import { getTierColor } from "@/lib/seat-tier-colors";

interface ManageSeatTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  existingTiers: SeatTier[];
}

export const ManageSeatTiersModal = ({
  isOpen,
  onClose,
  companyId,
  existingTiers = [],
}: ManageSeatTiersModalProps) => {
  const createSeatTier = useCreateSeatTier();
  const updateSeatTier = useUpdateSeatTier();
  const { toast } = useToast();
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [editingTier, setEditingTier] = useState<SeatTier | null>(null);
  const [newTier, setNewTier] = useState<CreateSeatTierInput>({
    name: "",
    description: "",
    basePrice: 0,
    companyId,
    isActive: true,
  });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNewTier({
      name: "",
      description: "",
      basePrice: 0,
      companyId,
      isActive: true,
    });
    setEditingTier(null);
    setIsAddingTier(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      toast({
        title: "Error",
        description: "Por favor seleccione una empresa primero.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTier) {
        // Update existing tier
        await updateSeatTier.mutateAsync({
          id: editingTier.id,
          name: newTier.name,
          description: newTier.description,
          basePrice: newTier.basePrice,
          isActive: newTier.isActive,
        });
        toast({
          title: "Tipo de asiento actualizado",
          description: "El tipo de asiento ha sido actualizado exitosamente.",
        });
      } else {
        // Create new tier
        await createSeatTier.mutateAsync({
          ...newTier,
          companyId,
        });
        toast({
          title: "Tipo de asiento creado",
          description: "El tipo de asiento ha sido creado exitosamente.",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al gestionar el tipo de asiento.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tier: SeatTier) => {
    setEditingTier(tier);
    setNewTier({
      name: tier.name,
      description: tier.description || "",
      basePrice: tier.basePrice,
      companyId: tier.companyId,
      isActive: tier.isActive,
    });
    setIsAddingTier(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Tipos de Asiento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tipos de Asiento</h3>
            {existingTiers.length < 5 && !isAddingTier && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingTier(true)}
              >
                Agregar Tipo de Asiento
              </Button>
            )}
          </div>

          {isAddingTier && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 border rounded p-4"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>
                  <Input
                    value={newTier.name}
                    onChange={(e) =>
                      setNewTier({ ...newTier, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={newTier.description}
                    onChange={(e) =>
                      setNewTier({ ...newTier, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Precio Base</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={newTier.basePrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewTier({
                        ...newTier,
                        basePrice: value === "" ? 0 : parseFloat(value),
                      });
                    }}
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit">
                  {editingTier ? "Actualizar" : "Guardar"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {existingTiers.map((tier, index) => {
              const colorClasses = getTierColor(index);
              return (
                <div
                  key={tier.id}
                  className={cn(
                    "border rounded p-3 flex justify-between items-center",
                    colorClasses.bg,
                    colorClasses.border
                  )}
                >
                  <div>
                    <h4 className="font-medium">{tier.name}</h4>
                    {tier.description && (
                      <p className="text-sm text-gray-500">
                        {tier.description}
                      </p>
                    )}
                    <p className="text-sm">Precio Base: ${tier.basePrice}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tier)}
                  >
                    Editar
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
