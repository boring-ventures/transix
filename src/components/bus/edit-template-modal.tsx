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
  BusTypeTemplate,
  UpdateBusTypeTemplateInput,
  updateBusTypeTemplateSchema,
  SeatTemplateMatrix,
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
import { useUpdateBusTemplate } from "@/hooks/useBusTemplates";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import { SeatEditor } from "./seat-editor";
import { Company } from "@/types/company.types";

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: BusTypeTemplate;
  companies: Company[];
}

export const EditTemplateModal = ({
  isOpen,
  onClose,
  template,
  companies,
}: EditTemplateModalProps) => {
  const { toast } = useToast();
  const updateBusTemplate = useUpdateBusTemplate();
  const { data: seatTiers } = useSeatTiers();

  const [selectedTierIds, setSelectedTierIds] = useState<{
    firstFloor: string | null;
    secondFloor: string | null;
  }>({
    firstFloor: null,
    secondFloor: null,
  });

  const editForm = useForm<UpdateBusTypeTemplateInput>({
    resolver: zodResolver(updateBusTypeTemplateSchema),
    defaultValues: {
      name: template.name,
      description: template.description || "",
      companyId: template.companyId,
      totalCapacity: template.totalCapacity,
      seatTemplateMatrix: template.seatTemplateMatrix,
      isActive: template.isActive,
    },
  });

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

    const currentMatrix = editForm.getValues("seatTemplateMatrix");
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

    editForm.setValue("seatTemplateMatrix", updatedMatrix, {
      shouldValidate: true,
    });
  };

  const handleMatrixChange = (newMatrix: SeatTemplateMatrix) => {
    const totalCapacity =
      newMatrix.firstFloor.seats.length +
      (newMatrix.secondFloor?.seats.length || 0);

    editForm.setValue("seatTemplateMatrix", newMatrix, {
      shouldValidate: true,
    });
    editForm.setValue("totalCapacity", totalCapacity, {
      shouldValidate: true,
    });
  };

  const handleSecondFloorToggle = (checked: boolean) => {
    const currentMatrix = editForm.getValues("seatTemplateMatrix");
    if (checked && !currentMatrix.secondFloor) {
      // Check if first floor seats have tiers assigned
      const unassignedSeats = currentMatrix.firstFloor.seats.some(
        (seat) => !seat.tierId
      );

      if (unassignedSeats) {
        toast({
          title: "Error",
          description:
            "Debe asignar niveles a todos los asientos del primer piso antes de agregar el segundo piso.",
          variant: "destructive",
        });
        return;
      }

      const newMatrix = {
        ...currentMatrix,
        secondFloor: {
          dimensions: currentMatrix.firstFloor.dimensions,
          seats: currentMatrix.firstFloor.seats.map((seat) => ({
            ...seat,
            id: `2${seat.name}`,
            name: `2${seat.name}`,
          })),
        },
      };

      handleMatrixChange(newMatrix);
    } else if (!checked && currentMatrix.secondFloor) {
      const { secondFloor, ...newMatrix } = currentMatrix;
      handleMatrixChange(newMatrix);
    }
  };

  const onSubmit = async (formData: UpdateBusTypeTemplateInput) => {
    try {
      await updateBusTemplate.mutateAsync({
        id: template.id,
        ...formData,
      });
      onClose();
      editForm.reset();
      setSelectedTierIds({
        firstFloor: null,
        secondFloor: null,
      });
      toast({
        title: "Plantilla actualizada",
        description: "La plantilla ha sido actualizada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al actualizar la plantilla.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Editar Plantilla de Bus</DialogTitle>
        </DialogHeader>
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Bus Details */}
              <div className="space-y-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
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
                  control={editForm.control}
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

              {/* Right Column - Seat Configuration */}
              <div className="space-y-6">
                <FormField
                  control={editForm.control}
                  name="seatTemplateMatrix"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuración de Asientos</FormLabel>
                      <FormControl>
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
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
