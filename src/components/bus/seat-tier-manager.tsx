import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateSeatTier } from "@/hooks/useSeatTiers";

interface SeatTierManagerProps {
  companyId: string;
  value: Array<{
    name: string;
    description?: string;
    basePrice: number;
    isActive?: boolean;
  }>;
  onChange: (
    tiers: Array<{
      name: string;
      description?: string;
      basePrice: number;
      isActive?: boolean;
    }>
  ) => void;
  existingTiers: Array<{
    id: string;
    name: string;
    companyId: string;
    basePrice: string;
  }>;
}

export const SeatTierManager = ({
  companyId,
  value = [],
  onChange,
  existingTiers = [],
}: SeatTierManagerProps) => {
  const createSeatTier = useCreateSeatTier();
  const { toast } = useToast();
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [newTier, setNewTier] = useState({
    name: "",
    description: "",
    basePrice: 0,
    isActive: true,
  });

  const addTier = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (newTier.name && newTier.basePrice >= 0) {
      try {
        await createSeatTier.mutateAsync({
          ...newTier,
          companyId,
        });
        onChange([...value, newTier]);
        setNewTier({ name: "", description: "", basePrice: 0, isActive: true });
        setIsAddingTier(false);
        toast({
          title: "Nivel creado",
          description: "El nivel de asiento ha sido creado exitosamente.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Hubo un error al crear el nivel de asiento.",
          variant: "destructive",
        });
      }
    }
  };

  const removeTier = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Niveles de Asiento</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setIsAddingTier(true);
          }}
        >
          Agregar Nivel
        </Button>
      </div>

      {isAddingTier && (
        <div className="space-y-4 border rounded p-4">
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input
                value={newTier.name}
                onChange={(e) =>
                  setNewTier({ ...newTier, name: e.target.value })
                }
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Input
                value={newTier.description}
                onChange={(e) =>
                  setNewTier({ ...newTier, description: e.target.value })
                }
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Precio Base</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                value={newTier.basePrice}
                onChange={(e) =>
                  setNewTier({
                    ...newTier,
                    basePrice: parseFloat(e.target.value),
                  })
                }
              />
            </FormControl>
          </FormItem>
          <div className="flex space-x-2">
            <Button type="button" onClick={addTier}>
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setIsAddingTier(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {existingTiers.map((tier) => (
          <div
            key={tier.id}
            className="border rounded p-3 flex justify-between items-center bg-gray-50"
          >
            <div>
              <h4 className="font-medium">{tier.name}</h4>
              <p className="text-sm">Precio Base: ${tier.basePrice}</p>
            </div>
            <span className="text-sm text-gray-500">Existente</span>
          </div>
        ))}

        {value.map((tier, index) => (
          <div
            key={index}
            className="border rounded p-3 flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium">{tier.name}</h4>
              {tier.description && (
                <p className="text-sm text-gray-500">{tier.description}</p>
              )}
              <p className="text-sm">
                Precio Base: ${tier.basePrice.toFixed(2)}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => removeTier(index, e)}
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
