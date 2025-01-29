import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateSeatTier } from "@/hooks/useSeatTiers";
import { SeatTier, CreateSeatTierInput } from "@/types/bus.types";

interface SeatTierManagerProps {
  companyId: string;
  existingTiers: SeatTier[];
  onChange: (
    selectedTiers: {
      name: string;
      basePrice: number;
      isActive: boolean;
      description?: string;
    }[]
  ) => void;
  value: {
    name: string;
    basePrice: number;
    isActive: boolean;
    description?: string;
  }[];
}

export const SeatTierManager = ({
  companyId,
  existingTiers = [],
  onChange,
  value = [],
}: SeatTierManagerProps) => {
  const createSeatTier = useCreateSeatTier();
  const { toast } = useToast();
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [newTier, setNewTier] = useState<CreateSeatTierInput>({
    name: "",
    description: "",
    basePrice: 0,
    companyId: "",
    isActive: true,
  });

  const addTier = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (newTier.name && newTier.basePrice >= 0) {
      try {
        const createdTier = await createSeatTier.mutateAsync({
          ...newTier,
          companyId,
        });

        // Add the new tier to the selected tiers
        onChange([
          ...value,
          {
            name: createdTier.name,
            basePrice: createdTier.basePrice,
            description: createdTier.description,
            isActive: createdTier.isActive,
          },
        ]);

        setNewTier({
          name: "",
          description: "",
          basePrice: 0,
          companyId: "",
          isActive: true,
        });
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

  const toggleTier = (tier: SeatTier) => {
    const tierData = {
      name: tier.name,
      basePrice:
        typeof tier.basePrice === "string"
          ? parseFloat(tier.basePrice)
          : tier.basePrice,
      description: tier.description || undefined,
      isActive: tier.isActive || false,
    };

    if (value.some((t) => t.name === tier.name)) {
      onChange(value.filter((t) => t.name !== tier.name));
    } else {
      onChange([...value, tierData]);
    }
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
            className={`border rounded p-3 flex justify-between items-center cursor-pointer ${
              value.some((t) => t.name === tier.name)
                ? "bg-gray-50 border-primary"
                : ""
            }`}
            onClick={() => toggleTier(tier)}
          >
            <div>
              <h4 className="font-medium">{tier.name}</h4>
              {tier.description && (
                <p className="text-sm text-gray-500">{tier.description}</p>
              )}
              <p className="text-sm">
                Precio Base: ${parseFloat(tier.basePrice.toString()).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
