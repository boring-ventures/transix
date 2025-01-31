import { useEffect } from "react";
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
  BusWithRelations,
  UpdateBusInput,
  updateBusSchema,
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
import { useUpdateBus } from "@/hooks/useBuses";
import { maintenanceStatusEnum } from "@/db/schema";
import { Company } from "@/types/company.types";
import { SeatMatrixPreview } from "./seat-matrix-preview";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditBusModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: BusWithRelations;
  companies: Company[];
}

export const EditBusModal = ({
  isOpen,
  onClose,
  bus,
  companies,
}: EditBusModalProps) => {
  const { toast } = useToast();
  const updateBus = useUpdateBus();
  const { data: seatTiers } = useSeatTiers();
  const seatMatrix = bus.seatMatrix as SeatTemplateMatrix;

  const editForm = useForm<UpdateBusInput>({
    resolver: zodResolver(updateBusSchema),
    defaultValues: {
      plateNumber: bus.plateNumber,
      companyId: bus.companyId || "",
      maintenanceStatus: bus.maintenanceStatus || "active",
      isActive: bus.isActive ?? true,
    },
  });

  useEffect(() => {
    if (bus) {
      editForm.reset({
        plateNumber: bus.plateNumber,
        companyId: bus.companyId || "",
        maintenanceStatus: bus.maintenanceStatus || "active",
        isActive: bus.isActive ?? true,
      });
    }
  }, [bus, editForm]);

  const onSubmit = async (formData: UpdateBusInput) => {
    try {
      await updateBus.mutateAsync({
        id: bus.id,
        data: formData,
      });
      onClose();
      toast({
        title: "Bus actualizado",
        description: "El bus ha sido actualizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al actualizar el bus.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Editar Bus</DialogTitle>
        </DialogHeader>
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(onSubmit)}
            className="flex-1 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-6 p-6 h-full">
              {/* Left Column - Bus Details */}
              <div className="space-y-6 overflow-auto pr-2">
                <div className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Placa</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="companyId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compañía</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar compañía" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies.map((company) => (
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
                    name="maintenanceStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de Mantenimiento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "active"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {maintenanceStatusEnum.enumValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Seat Map */}
              <div className="space-y-6 overflow-auto pr-2">
                <div className="border rounded-lg p-4 bg-background">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium">
                      Vista Superior del Bus
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Distribución de Asientos
                    </p>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div
                        className={cn(
                          "grid gap-6",
                          seatMatrix.secondFloor ? "grid-cols-2" : "grid-cols-1"
                        )}
                      >
                        <div
                          className={cn(
                            !seatMatrix.secondFloor &&
                              "max-w-2xl mx-auto w-full"
                          )}
                        >
                          <h4 className="text-sm font-medium mb-2">
                            Primer Piso
                          </h4>
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[350px] w-full">
                            <div className="w-full h-full flex items-center justify-center p-8">
                              <div className="w-fit max-w-full max-h-full">
                                <SeatMatrixPreview
                                  matrix={seatMatrix}
                                  seatTiers={seatTiers || []}
                                  className="justify-center"
                                  floor={1}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {seatMatrix.secondFloor && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Segundo Piso
                            </h4>
                            <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[350px] w-full">
                              <div className="w-full h-full flex items-center justify-center p-8">
                                <div className="w-fit max-w-full max-h-full">
                                  <SeatMatrixPreview
                                    matrix={seatMatrix}
                                    seatTiers={seatTiers || []}
                                    className="justify-center"
                                    floor={2}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-4 mt-4">
                        <Badge variant="outline" className="bg-background">
                          ← Izquierda
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          Frente
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          Derecha →
                        </Badge>
                      </div>
                    </div>

                    {/* Leyenda de Tipos de Asiento */}
                    <div className="w-64 border-l pl-6">
                      <h3 className="text-sm font-medium mb-3">
                        Leyenda de Tipos de Asiento
                      </h3>
                      <div className="flex flex-col gap-2">
                        {seatTiers?.map((tier, index) => {
                          const colorVariants = {
                            first: "bg-red-100 border-red-200",
                            second: "bg-red-200 border-red-300",
                            third: "bg-gray-100 border-gray-200",
                            fourth: "bg-gray-200 border-gray-300",
                            fifth: "bg-red-50 border-red-100",
                          };
                          const colors = Object.values(colorVariants);
                          const colorClass = colors[index % colors.length];

                          return (
                            <div
                              key={tier.id}
                              className="flex items-center gap-2 px-3 py-1.5 border rounded-lg"
                            >
                              <div
                                className={`w-4 h-4 rounded-full border ${colorClass}`}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {tier.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ${parseFloat(tier.basePrice).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 p-6 border-t bg-muted/50">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateBus.isPending}>
                Actualizar Bus
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
