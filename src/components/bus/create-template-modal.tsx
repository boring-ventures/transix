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

export const CreateTemplateModal = ({
  isOpen,
  onClose,
  companies,
}: CreateTemplateModalProps) => {
  const { toast } = useToast();
  const createBusTemplate = useCreateBusTemplate();
  const { data: seatTiers } = useSeatTiers();

  const createForm = useForm<CreateBusTypeTemplateInput>({
    resolver: zodResolver(createBusTypeTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: "",
      totalCapacity: 0,
      seatTemplateMatrix: {
        firstFloor: Array(4)
          .fill(null)
          .map((_, rowIndex) =>
            Array(4)
              .fill(null)
              .map(
                (_, seatIndex) =>
                  `${rowIndex + 1}${String.fromCharCode(65 + seatIndex)}`
              )
          ),
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

  const [seatTierAssignments, setSeatTierAssignments] = useState<{
    firstFloor: Record<string, string>;
    secondFloor: Record<string, string>;
  }>({
    firstFloor: {},
    secondFloor: {},
  });

  const handleMatrixChange = useCallback(
    (newMatrix: { firstFloor: string[][]; secondFloor?: string[][] }) => {
      const totalCapacity = calculateTotalCapacity(newMatrix);
      createForm.setValue("seatTemplateMatrix", newMatrix, {
        shouldValidate: true,
      });
      createForm.setValue("totalCapacity", totalCapacity, {
        shouldValidate: true,
      });

      // If second floor is added and there are no existing second floor assignments
      if (
        newMatrix.secondFloor &&
        Object.keys(seatTierAssignments.secondFloor).length === 0
      ) {
        // Create a mapping of old seat IDs to new seat IDs
        const newSecondFloorSeats = newMatrix.secondFloor.flat();
        const firstFloorSeats = newMatrix.firstFloor.flat();

        // Copy assignments from first floor to second floor
        const newSecondFloorAssignments: Record<string, string> = {};
        newSecondFloorSeats.forEach((seatId, index) => {
          const firstFloorSeatId = firstFloorSeats[index];
          if (
            firstFloorSeatId &&
            seatTierAssignments.firstFloor[firstFloorSeatId]
          ) {
            newSecondFloorAssignments[seatId] =
              seatTierAssignments.firstFloor[firstFloorSeatId];
          }
        });

        setSeatTierAssignments((prev) => ({
          ...prev,
          secondFloor: newSecondFloorAssignments,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      createForm,
      seatTierAssignments.firstFloor,
      seatTierAssignments.secondFloor,
    ]
  );

  const calculateTotalCapacity = useCallback(
    (seatMatrix: { firstFloor: string[][]; secondFloor?: string[][] }) => {
      const firstFloorCapacity = seatMatrix.firstFloor.reduce(
        (acc, row) => acc + row.length,
        0
      );
      const secondFloorCapacity =
        seatMatrix.secondFloor?.reduce((acc, row) => acc + row.length, 0) || 0;
      return firstFloorCapacity + secondFloorCapacity;
    },
    []
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

    setSeatTierAssignments((prev) => ({
      ...prev,
      [floor]: {
        ...prev[floor],
        [seatId]: selectedTierId,
      },
    }));
  };

  const onSubmit = async (formData: CreateBusTypeTemplateInput) => {
    try {
      const dataWithAssignments = {
        ...formData,
        seatTierAssignments: {
          firstFloor: seatTierAssignments.firstFloor,
          ...(formData.seatTemplateMatrix.secondFloor
            ? { secondFloor: seatTierAssignments.secondFloor }
            : {}),
        },
      };

      await createBusTemplate.mutateAsync(dataWithAssignments);
      onClose();
      createForm.reset();
      setSeatTierAssignments({
        firstFloor: {},
        secondFloor: {},
      });
      setSelectedTierIds({
        firstFloor: null,
        secondFloor: null,
      });
      toast({
        title: "Plantilla creada",
        description: "La plantilla ha sido creada exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al crear la plantilla.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Crear Plantilla de Bus</DialogTitle>
        </DialogHeader>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Bus Details and Seat Tiers */}
              <div className="space-y-6">
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
              <div className="space-y-6">
                <FormField
                  control={createForm.control}
                  name="seatTemplateMatrix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuración de Asientos</FormLabel>
                      <FormControl>
                        <SeatEditor
                          value={field.value}
                          onChange={handleMatrixChange}
                          onSeatClick={(seatId, floor) =>
                            handleSeatClick(seatId, floor)
                          }
                          seatTierAssignments={seatTierAssignments}
                          selectedTierIds={selectedTierIds}
                          onTierSelect={(floor, tierId) =>
                            setSelectedTierIds((prev) => ({
                              ...prev,
                              [floor]: tierId,
                            }))
                          }
                          seatTiers={seatTiers || []}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
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
