import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateSeatTier } from "@/hooks/useSeatTiers";
import { SeatTier, CreateSeatTierInput } from "@/types/bus.types";
import { cn } from "@/lib/utils";

interface SeatTierManagerProps {
  companyId: string;
  existingTiers: SeatTier[];
  onChange: (
    selectedTiers: {
      id: string;
      name: string;
      basePrice: number;
      isActive: boolean;
      description?: string;
      companyId: string;
    }[]
  ) => void;
  value: {
    id: string;
    name: string;
    basePrice: number;
    isActive: boolean;
    description?: string;
    companyId: string;
  }[];
}

const TIER_COLORS = [
  {
    bg: "bg-red-100",
    border: "border-red-200",
    selected: "bg-red-500 text-white",
  },
  {
    bg: "bg-red-200",
    border: "border-red-300",
    selected: "bg-red-600 text-white",
  },
  {
    bg: "bg-gray-100",
    border: "border-gray-200",
    selected: "bg-gray-500 text-white",
  },
  {
    bg: "bg-gray-200",
    border: "border-gray-300",
    selected: "bg-gray-600 text-white",
  },
  {
    bg: "bg-red-50",
    border: "border-red-100",
    selected: "bg-red-400 text-white",
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
            id: createdTier.id,
            name: createdTier.name,
            basePrice: createdTier.basePrice,
            description: createdTier.description,
            isActive: createdTier.isActive,
            companyId: createdTier.companyId,
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
          title: "Tipo de asiento creado",
          description: "El tipo de asiento ha sido creado exitosamente.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Hubo un error al crear el tipo de asiento.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tipos de Asiento</h3>
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
            Agregar Tipo de Asiento
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
          const isSelected = value.some(
            (selectedTier) => selectedTier.name === tier.name
          );

          return (
            <div
              key={tier.id}
              className={cn(
                "border rounded p-3 flex justify-between items-center cursor-pointer",
                colorClasses.bg,
                colorClasses.border,
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => {
                const newValue = isSelected
                  ? value.filter(
                      (selectedTier) => selectedTier.name !== tier.name
                    )
                  : [
                      ...value,
                      {
                        id: tier.id,
                        name: tier.name,
                        basePrice:
                          typeof tier.basePrice === "string"
                            ? parseFloat(tier.basePrice)
                            : tier.basePrice,
                        description: tier.description || undefined,
                        isActive: tier.isActive ?? true,
                        companyId: tier.companyId,
                      },
                    ];
                onChange(newValue);
              }}
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
