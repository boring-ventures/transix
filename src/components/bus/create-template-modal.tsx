import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import {
  CreateBusTypeTemplateInput,
  createBusTypeTemplateSchema,
  SeatTemplateMatrix,
  SeatPosition,
  busTypeTemplateSchema,
} from "@/types/bus.types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateBusTemplate } from "@/hooks/useBusTemplates";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import { SeatEditor } from "./seat-editor";
import { SeatTierManager } from "./seat-tier-manager";
import { Company } from "@/types/company.types";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
}

const generateSeats = (
  config: { rows: number; seatsPerRow: number },
  existingSeats: SeatPosition[] = [],
  isSecondFloor: boolean = false
): SeatPosition[] => {
  const seats: SeatPosition[] = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.seatsPerRow; col++) {
      const name = `${row + 1}${String.fromCharCode(65 + col)}`;
      const seatId = isSecondFloor ? `2${name}` : name;
      const existingSeat = existingSeats.find((s) => s.id === seatId);
      seats.push({
        id: seatId,
        name: isSecondFloor ? `2${name}` : name,
        row,
        column: col,
        tierId: existingSeat?.tierId,
      });
    }
  }
  return seats;
};

export const CreateTemplateModal = ({
  isOpen,
  onClose,
  companies,
}: CreateTemplateModalProps) => {
  const { toast } = useToast();
  const createBusTemplate = useCreateBusTemplate();
  const { data: seatTiers } = useSeatTiers();

  const [firstFloorConfig, setFirstFloorConfig] = useState({
    rows: 4,
    seatsPerRow: 4,
  });

  const createForm = useForm<CreateBusTypeTemplateInput>({
    resolver: zodResolver(busTypeTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: "",
      totalCapacity: 0,
      seatTemplateMatrix: {
        firstFloor: {
          dimensions: firstFloorConfig,
          seats: generateSeats(firstFloorConfig),
        },
      },
      seatTiers: [],
      isActive: true,
    },
  });

  const [selectedTierIds, setSelectedTierIds] = useState<{
    firstFloor: string | null;
    secondFloor: string | null;
  }>({
    firstFloor: null,
    secondFloor: null,
  });

  const calculateTotalCapacity = useCallback(
    (seatMatrix: SeatTemplateMatrix) => {
      const firstFloorCapacity = seatMatrix.firstFloor.seats.length;
      const secondFloorCapacity = seatMatrix.secondFloor?.seats.length || 0;
      return firstFloorCapacity + secondFloorCapacity;
    },
    []
  );

  const handleMatrixChange = useCallback(
    (newMatrix: SeatTemplateMatrix) => {
      // Update floor configs
      setFirstFloorConfig(newMatrix.firstFloor.dimensions);

      // Calculate total capacity
      const totalCapacity = calculateTotalCapacity(newMatrix);

      // Update form values
      createForm.setValue("seatTemplateMatrix", newMatrix, {
        shouldValidate: true,
      });
      createForm.setValue("totalCapacity", totalCapacity, {
        shouldValidate: true,
      });
    },
    [createForm, calculateTotalCapacity]
  );

  const handleSeatClick = (
    seatId: string,
    floor: "firstFloor" | "secondFloor"
  ) => {
    const selectedTierId = selectedTierIds[floor];
    if (!selectedTierId) {
      toast({
        title: "Selecciona un nivel",
        description: "Por favor selecciona un nivel de asiento primero.",
        variant: "destructive",
      });
      return;
    }

    const currentMatrix = createForm.getValues("seatTemplateMatrix");
    if (!currentMatrix[floor]) return;

    const updatedMatrix = {
      ...currentMatrix,
      [floor]: {
        ...currentMatrix[floor],
        seats: currentMatrix[floor].seats.map((seat) =>
          seat.id === seatId ? { ...seat, tierId: selectedTierId } : seat
        ),
      },
    };

    createForm.setValue("seatTemplateMatrix", updatedMatrix, {
      shouldValidate: true,
    });
  };

  const handleSecondFloorToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Check if first floor seats have tiers assigned
        const currentMatrix = createForm.getValues("seatTemplateMatrix");
        const unassignedSeats = currentMatrix.firstFloor.seats.some(
          (seat) => !seat.tierId
        );

        if (unassignedSeats) {
          toast({
            title: "Error",
            description:
              "Debe asignar tipos de asiento a todos los asientos del primer piso antes de agregar el segundo piso.",
            variant: "destructive",
          });
          return;
        }

        const newConfig = {
          rows: firstFloorConfig.rows,
          seatsPerRow: firstFloorConfig.seatsPerRow,
        };

        const updatedMatrix: SeatTemplateMatrix = {
          firstFloor: currentMatrix.firstFloor,
          secondFloor: {
            dimensions: newConfig,
            seats: currentMatrix.firstFloor.seats.map((seat) => ({
              ...seat,
              id: `2${seat.name}`,
              name: `2${seat.name}`,
              tierId: seat.tierId,
            })),
          },
        };

        setSelectedTierIds((prev) => ({
          ...prev,
          secondFloor: prev.firstFloor,
        }));

        createForm.setValue("seatTemplateMatrix", updatedMatrix, {
          shouldValidate: true,
        });
      } else {
        const currentMatrix = createForm.getValues("seatTemplateMatrix");
        const newMatrix = {
          firstFloor: currentMatrix.firstFloor,
        };
        createForm.setValue("seatTemplateMatrix", newMatrix, {
          shouldValidate: true,
        });

        setSelectedTierIds((prev) => ({
          ...prev,
          secondFloor: null,
        }));
      }
    },
    [createForm, firstFloorConfig, toast]
  );

  const onSubmit = async (formData: CreateBusTypeTemplateInput) => {
    try {
      // Validate with submission schema manually
      console.log(formData);
      const result = createBusTypeTemplateSchema.safeParse(formData);
      if (!result.success) {
        const errors = result.error.errors;
        errors.forEach((error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        });
        return;
      }

      await createBusTemplate.mutateAsync(formData);
      onClose();
      createForm.reset();
      setSelectedTierIds({
        firstFloor: null,
        secondFloor: null,
      });
      toast({
        title: "Plantilla creada",
        description: "La plantilla ha sido creada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al crear la plantilla.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Crear Plantilla de Bus</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(onSubmit)}
            className="flex-1 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-6 p-6 h-full">
              {/* Left Column - Bus Details and Seat Tiers */}
              <div className="space-y-6 overflow-auto pr-2">
                <div className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies?.map((company) => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <FormField
                    control={createForm.control}
                    name="seatTiers"
                    render={({ field }) => (
                      <FormItem>
                        <SeatTierManager
                          companyId={createForm.watch("companyId")}
                          value={field.value}
                          onChange={(selectedTiers) => {
                            field.onChange(selectedTiers);
                          }}
                          existingTiers={seatTiers || []}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Seat Configuration */}
              <div className="space-y-6 overflow-auto pr-2">
                <FormField
                  control={createForm.control}
                  name="seatTemplateMatrix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuración de Asientos</FormLabel>
                      <FormControl>
                        <div className="border rounded-lg p-4 bg-background">
                          <SeatEditor
                            value={field.value}
                            onChange={handleMatrixChange}
                            onSeatClick={(seatId, floor) =>
                              handleSeatClick(seatId, floor)
                            }
                            selectedTierIds={selectedTierIds}
                            onTierSelect={(floor, tierId) =>
                              setSelectedTierIds((prev) => ({
                                ...prev,
                                [floor]: tierId,
                              }))
                            }
                            seatTiers={seatTiers || []}
                            onSecondFloorToggle={handleSecondFloorToggle}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t bg-muted/50">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Crear Plantilla</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
