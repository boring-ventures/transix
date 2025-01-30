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

const TIER_COLORS = [
  {
    bg: "bg-purple-100",
    border: "border-purple-200",
    selected: "bg-purple-500 text-white",
  },
  {
    bg: "bg-blue-100",
    border: "border-blue-200",
    selected: "bg-blue-500 text-white",
  },
  {
    bg: "bg-green-100",
    border: "border-green-200",
    selected: "bg-green-500 text-white",
  },
  {
    bg: "bg-yellow-100",
    border: "border-yellow-200",
    selected: "bg-yellow-500 text-white",
  },
  {
    bg: "bg-pink-100",
    border: "border-pink-200",
    selected: "bg-pink-500 text-white",
  },
];

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Niveles de Asiento</h3>
        {existingTiers.length < 5 && (
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
        )}
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
        {existingTiers.map((tier, index) => {
          const colorClasses = TIER_COLORS[index % TIER_COLORS.length];
          return (
            <div
              key={tier.id}
              className={`border rounded p-3 flex justify-between items-center ${colorClasses.bg} ${colorClasses.border}`}
            >
              <div>
                <h4 className="font-medium">{tier.name}</h4>
                {tier.description && (
                  <p className="text-sm text-gray-500">{tier.description}</p>
                )}
                <p className="text-sm">Precio Base: ${tier.basePrice}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
