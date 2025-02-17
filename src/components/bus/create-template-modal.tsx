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
import { ManageSeatTiersModal } from "./manage-seat-tiers-modal";
import { Company } from "@/types/company.types";
import { cn } from "@/lib/utils";
import { getTierColor } from "@/lib/seat-tier-colors";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { EditTemplateSeatModal } from "./edit-template-seat-modal";

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
        tierId: existingSeat?.tierId || "",
        isEmpty: existingSeat?.isEmpty || false,
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
  const [isSeatTierModalOpen, setIsSeatTierModalOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<
    "firstFloor" | "secondFloor"
  >("firstFloor");

  const [firstFloorConfig, setFirstFloorConfig] = useState({
    rows: 4,
    seatsPerRow: 4,
  });

  const createForm = useForm<CreateBusTypeTemplateInput>({
    resolver: zodResolver(createBusTypeTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: "",
      totalCapacity: 0,
      type: "standard",
      seatsLayout: "",
      seatTemplateMatrix: {
        firstFloor: {
          dimensions: firstFloorConfig,
          seats: generateSeats(firstFloorConfig),
        },
      },
      isActive: true,
    },
    mode: "onChange",
  });

  // Add form state logging
  console.log("Form State:", {
    values: createForm.getValues(),
    errors: createForm.formState.errors,
    isDirty: createForm.formState.isDirty,
    isValid: createForm.formState.isValid,
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

      // Update form values without validation
      createForm.setValue(
        "seatTemplateMatrix",
        newMatrix as SeatTemplateMatrix,
        {
          shouldValidate: false,
        }
      );
      createForm.setValue("totalCapacity", totalCapacity, {
        shouldValidate: false,
      });
    },
    [createForm, calculateTotalCapacity]
  );

  const handleSeatClick = (
    seatId: string,
    floor: "firstFloor" | "secondFloor"
  ) => {
    if (isMultiSelectMode) {
      setSelectedSeats((prev) =>
        prev.includes(seatId)
          ? prev.filter((id) => id !== seatId)
          : [...prev, seatId]
      );
      return;
    }

    setSelectedSeatId(seatId);
    setSelectedFloor(floor);
  };

  const handleSeatUpdate = (seatId: string, updates: Partial<SeatPosition>) => {
    const currentMatrix = createForm.getValues("seatTemplateMatrix");
    const floorData = currentMatrix[selectedFloor];
    if (!floorData) return;

    const seatIndex = floorData.seats.findIndex((s) => s.id === seatId);
    if (seatIndex === -1) return;

    const updatedSeats = [...floorData.seats];
    updatedSeats[seatIndex] = {
      ...updatedSeats[seatIndex],
      ...updates,
    };

    const updatedMatrix = {
      ...currentMatrix,
      [selectedFloor]: {
        ...floorData,
        seats: updatedSeats,
      },
    };

    createForm.setValue("seatTemplateMatrix", updatedMatrix, {
      shouldValidate: false,
    });
    setSelectedSeatId(null);
  };

  const handleBulkAction = (
    action: "empty" | "fill" | "tier",
    tierId?: string
  ) => {
    if (selectedSeats.length === 0) return;

    const currentMatrix = createForm.getValues("seatTemplateMatrix");
    const updatedMatrix = {
      firstFloor: {
        ...currentMatrix.firstFloor,
        seats: currentMatrix.firstFloor.seats.map((seat) => {
          if (!selectedSeats.includes(seat.id)) return seat;

          switch (action) {
            case "empty":
              return {
                ...seat,
                isEmpty: true,
                tierId: "",
              };
            case "fill":
              return {
                ...seat,
                isEmpty: false,
                tierId: selectedTierIds.firstFloor || "",
              };
            case "tier":
              return {
                ...seat,
                isEmpty: false,
                tierId: tierId || "",
              };
            default:
              return seat;
          }
        }),
      },
      ...(currentMatrix.secondFloor && {
        secondFloor: {
          ...currentMatrix.secondFloor,
          seats: currentMatrix.secondFloor.seats.map((seat) => {
            if (!selectedSeats.includes(seat.id)) return seat;

            switch (action) {
              case "empty":
                return {
                  ...seat,
                  isEmpty: true,
                  tierId: "",
                };
              case "fill":
                return {
                  ...seat,
                  isEmpty: false,
                  tierId: selectedTierIds.secondFloor || "",
                };
              case "tier":
                return {
                  ...seat,
                  isEmpty: false,
                  tierId: tierId || "",
                };
              default:
                return seat;
            }
          }),
        },
      }),
    } as SeatTemplateMatrix;

    createForm.setValue("seatTemplateMatrix", updatedMatrix, {
      shouldValidate: false,
    });
    setSelectedSeats([]);
  };

  const handleSecondFloorToggle = useCallback(
    (checked: boolean) => {
      if (checked) {
        // Check if first floor seats have tiers assigned
        const currentMatrix = createForm.getValues("seatTemplateMatrix");
        const unassignedSeats = currentMatrix.firstFloor.seats.some(
          (seat) => !seat.isEmpty && !seat.tierId
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
              isEmpty: seat.isEmpty,
            })),
          },
        };

        setSelectedTierIds((prev) => ({
          ...prev,
          secondFloor: prev.firstFloor,
        }));

        createForm.setValue("seatTemplateMatrix", updatedMatrix, {
          shouldValidate: false,
        });
      } else {
        const currentMatrix = createForm.getValues("seatTemplateMatrix");
        const newMatrix = {
          firstFloor: currentMatrix.firstFloor,
        };
        createForm.setValue("seatTemplateMatrix", newMatrix, {
          shouldValidate: false,
        });

        setSelectedTierIds((prev) => ({
          ...prev,
          secondFloor: null,
        }));
      }
    },
    [createForm, firstFloorConfig, toast]
  );

  const handleOpenSeatTierModal = () => {
    const companyId = createForm.getValues("companyId");
    if (!companyId) {
      toast({
        title: "Error",
        description: "Por favor seleccione una empresa primero.",
        variant: "destructive",
      });
      return;
    }
    setIsSeatTierModalOpen(true);
  };

  const onSubmit = async (formData: CreateBusTypeTemplateInput) => {
    try {
      // Log the form data being submitted
      console.log("Submitting form data:", JSON.stringify(formData, null, 2));

      // Ensure companyId is selected
      if (!formData.companyId) {
        toast({
          title: "Error",
          description: "Por favor seleccione una empresa.",
          variant: "destructive",
        });
        return;
      }

      // Log seat assignments before validation
      console.log("Seat assignments:", {
        firstFloor: formData.seatTemplateMatrix.firstFloor.seats.map((s) => ({
          id: s.id,
          isEmpty: s.isEmpty,
          tierId: s.tierId,
        })),
        secondFloor: formData.seatTemplateMatrix.secondFloor?.seats.map(
          (s) => ({
            id: s.id,
            isEmpty: s.isEmpty,
            tierId: s.tierId,
          })
        ),
      });

      // Validate with submission schema manually
      const result = createBusTypeTemplateSchema.safeParse(formData);

      // Log validation result
      console.log("Validation result:", {
        success: result.success,
        errors: !result.success ? result.error.format() : null,
      });

      if (!result.success) {
        const errors = result.error.errors;
        errors.forEach((error) => {
          console.log("Validation error:", {
            path: error.path,
            message: error.message,
            code: error.code,
          });
          toast({
            title: "Error de validación",
            description: `${error.path.join(".")}: ${error.message}`,
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
      console.error("Form submission error:", error);
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

  const selectedSeat =
    selectedSeatId &&
    createForm
      .getValues("seatTemplateMatrix")
      [selectedFloor]?.seats.find((s) => s.id === selectedSeatId);

  return (
    <>
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
                {/* Left Column - Bus Details */}
                <div className="space-y-6 overflow-auto pr-2">
                  <div className="space-y-4 px-1">
                    <FormField
                      control={createForm.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem className="pb-1">
                          <FormLabel>Empresa</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
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
                        <FormItem className="pb-1">
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="pb-1">
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Tipos de Asiento</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleOpenSeatTierModal}
                      >
                        Gestionar Tipos de Asiento
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {seatTiers?.map((tier, index) => {
                        const colorClasses = getTierColor(index);
                        return (
                          <div
                            key={tier.id}
                            className={cn(
                              "border rounded p-3",
                              colorClasses.bg,
                              colorClasses.border
                            )}
                          >
                            <h4 className="font-medium">{tier.name}</h4>
                            {tier.description && (
                              <p className="text-sm text-gray-500">
                                {tier.description}
                              </p>
                            )}
                            <p className="text-sm">
                              Precio Base: ${tier.basePrice}
                            </p>
                          </div>
                        );
                      })}
                    </div>
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
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    id="multi-select"
                                    checked={isMultiSelectMode}
                                    onCheckedChange={(checked) => {
                                      setIsMultiSelectMode(checked);
                                      if (!checked) setSelectedSeats([]);
                                    }}
                                  />
                                  <Label htmlFor="multi-select">
                                    Selección múltiple
                                  </Label>
                                </div>
                              </div>
                              {selectedSeats.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {selectedSeats.length} asientos
                                    seleccionados
                                  </span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        Acciones{" "}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleBulkAction("empty")
                                        }
                                      >
                                        Marcar como espacio vacío
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleBulkAction("fill")}
                                      >
                                        Marcar como asiento
                                      </DropdownMenuItem>
                                      {seatTiers?.map((tier) => (
                                        <DropdownMenuItem
                                          key={tier.id}
                                          onClick={() =>
                                            handleBulkAction("tier", tier.id)
                                          }
                                        >
                                          Asignar nivel: {tier.name}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              )}
                            </div>

                            <div className="border rounded-lg p-4 bg-background">
                              <SeatEditor
                                value={field.value}
                                onChange={handleMatrixChange}
                                onSeatClick={handleSeatClick}
                                selectedTierIds={selectedTierIds}
                                onTierSelect={(floor, tierId) =>
                                  setSelectedTierIds((prev) => ({
                                    ...prev,
                                    [floor]: tierId,
                                  }))
                                }
                                seatTiers={seatTiers || []}
                                onSecondFloorToggle={handleSecondFloorToggle}
                                emptyStyle="dashed"
                                selectedSeats={selectedSeats}
                                isMultiSelectMode={isMultiSelectMode}
                              />
                            </div>
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

      {selectedSeat && (
        <EditTemplateSeatModal
          isOpen={!!selectedSeatId}
          onClose={() => setSelectedSeatId(null)}
          seat={selectedSeat}
          seatTiers={seatTiers || []}
          onUpdate={handleSeatUpdate}
        />
      )}

      <ManageSeatTiersModal
        isOpen={isSeatTierModalOpen}
        onClose={() => setIsSeatTierModalOpen(false)}
        companyId={createForm.getValues("companyId")}
        existingTiers={seatTiers || []}
      />
    </>
  );
};
