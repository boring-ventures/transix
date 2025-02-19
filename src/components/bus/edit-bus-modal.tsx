import { useEffect, useState } from "react";
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
import { maintenance_status_enum } from "@prisma/client";
import { Company } from "@/types/company.types";
import { SeatMatrixPreview } from "./seat-matrix-preview";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditSeatModal } from "./edit-seat-modal";
import { useBusSeats, useBulkUpdateSeats } from "@/hooks/useBusSeats";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const { data: busSeats, refetch: refetchBusSeats } = useBusSeats(bus.id);
  const bulkUpdateSeats = useBulkUpdateSeats();
  const seatMatrix = bus.template?.seatTemplateMatrix as SeatTemplateMatrix;
  const [selectedSeatId, setSelectedSeatId] = useState<string | undefined>(
    undefined
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isEditSeatModalOpen, setIsEditSeatModalOpen] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const editForm = useForm<UpdateBusInput>({
    resolver: zodResolver(updateBusSchema),
    defaultValues: {
      plateNumber: bus.plateNumber,
      companyId: bus.company?.id || "",
      maintenanceStatus: (bus.maintenanceStatus ||
        "active") as maintenance_status_enum,
      isActive: bus.isActive ?? true,
    },
  });

  useEffect(() => {
    if (bus) {
      editForm.reset({
        plateNumber: bus.plateNumber,
        companyId: bus.company?.id || "",
        maintenanceStatus: (bus.maintenanceStatus ||
          "active") as maintenance_status_enum,
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

  const selectedSeat = busSeats?.find((seat) => seat.id === selectedSeatId);
  const selectedSeatTier = selectedSeat
    ? seatTiers?.find((tier) => tier.id === selectedSeat.tierId)
    : undefined;

  const handleSeatClick = (seatId: string) => {
    const seat = busSeats?.find((s) => s.id === seatId);
    if (!seat) return;

    if (isMultiSelectMode) {
      setSelectedSeats((prev) =>
        prev.includes(seatId)
          ? prev.filter((id) => id !== seatId)
          : [...prev, seatId]
      );
    } else {
      setSelectedSeatId(seatId);
      setIsEditSeatModalOpen(true);
    }
  };

  const handleBulkStatusUpdate = async (
    status: "available" | "maintenance"
  ) => {
    if (selectedSeats.length === 0) return;

    const validSeats = selectedSeats.filter((seatId) =>
      busSeats?.some((s) => s.id === seatId)
    );

    if (validSeats.length === 0) return;

    try {
      await bulkUpdateSeats.mutateAsync({
        seatIds: validSeats,
        data: { status },
      });
      setSelectedSeats([]);
      setIsMultiSelectMode(false);
      await refetchBusSeats();
      toast({
        title: "Asientos actualizados",
        description: "Los asientos han sido actualizados exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al actualizar los asientos.",
        variant: "destructive",
      });
    }
  };

  const handleBulkTierUpdate = async (tierId: string) => {
    if (selectedSeats.length === 0) return;

    const validSeats = selectedSeats.filter((seatId) =>
      busSeats?.some((s) => s.id === seatId)
    );

    if (validSeats.length === 0) return;

    try {
      await bulkUpdateSeats.mutateAsync({
        seatIds: validSeats,
        data: { tierId },
      });
      setSelectedSeats([]);
      setIsMultiSelectMode(false);
      await refetchBusSeats();
      toast({
        title: "Asientos actualizados",
        description: "Los niveles han sido actualizados exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Hubo un error al actualizar los asientos.",
        variant: "destructive",
      });
    }
  };

  const handleMultiSelectToggle = (checked: boolean) => {
    setIsMultiSelectMode(checked);
    if (!checked) {
      setSelectedSeats([]);
    }
  };

  return (
    <>
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
              <Tabs defaultValue="details" className="flex-1 flex flex-col">
                <div className="border-b px-6">
                  <TabsList className="w-full justify-start gap-6 rounded-none border-b-0 pl-0">
                    <TabsTrigger
                      value="details"
                      className="relative rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary"
                    >
                      Detalles
                    </TabsTrigger>
                    <TabsTrigger
                      value="seats"
                      className="relative rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary"
                    >
                      Asientos
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1">
                  <TabsContent value="details" className="m-0">
                    <div className="p-6 space-y-6">
                      <h2 className="text-lg font-semibold">
                        Información General
                      </h2>
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
                                    <SelectItem
                                      key={company.id}
                                      value={company.id}
                                    >
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
                                  {Object.values(maintenance_status_enum).map(
                                    (status) => (
                                      <SelectItem key={status} value={status}>
                                        {status === "active"
                                          ? "Activo"
                                          : status === "in_maintenance"
                                          ? "En Mantenimiento"
                                          : "Retirado"}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Información Adicional
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Plantilla
                            </h4>
                            <p className="text-sm">
                              {bus.template?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Capacidad Total
                            </h4>
                            <p className="text-sm">
                              {bus.template?.totalCapacity || 0} asientos
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Fecha de Creación
                            </h4>
                            <p className="text-sm">
                              {bus.template?.createdAt
                                ? new Date(
                                    bus.template.createdAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">
                              Última Actualización
                            </h4>
                            <p className="text-sm">
                              {bus.template?.updatedAt
                                ? new Date(
                                    bus.template.updatedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="seats" className="m-0">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <h2 className="text-lg font-semibold">
                            Vista Superior del Bus
                          </h2>
                          <div className="flex items-center gap-2">
                            <Switch
                              id="multi-select"
                              checked={isMultiSelectMode}
                              onCheckedChange={handleMultiSelectToggle}
                            />
                            <Label htmlFor="multi-select">
                              Selección múltiple
                            </Label>
                          </div>
                        </div>
                        {selectedSeats.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {selectedSeats.length} asientos seleccionados
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Acciones{" "}
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleBulkStatusUpdate("available")
                                  }
                                >
                                  Marcar como disponibles
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleBulkStatusUpdate("maintenance")
                                  }
                                >
                                  Marcar como mantenimiento
                                </DropdownMenuItem>
                                {seatTiers?.map((tier) => (
                                  <DropdownMenuItem
                                    key={tier.id}
                                    onClick={() =>
                                      handleBulkTierUpdate(tier.id)
                                    }
                                  >
                                    Cambiar a nivel: {tier.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-6">
                        <div className="flex-1">
                          <div
                            className={cn(
                              "grid gap-6",
                              seatMatrix.secondFloor
                                ? "grid-cols-2"
                                : "grid-cols-1"
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
                                <div className="w-full h-full flex items-center justify-center p-4">
                                  <div className="w-full h-full flex items-center justify-center">
                                    <SeatMatrixPreview
                                      matrix={seatMatrix}
                                      seatTiers={seatTiers || []}
                                      className="justify-center scale-90 transform origin-center"
                                      floor={1}
                                      mode="bus"
                                      variant="default"
                                      seats={busSeats}
                                      onSeatClick={handleSeatClick}
                                      selectedSeatId={selectedSeatId}
                                      selectedSeats={selectedSeats}
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
                                  <div className="w-full h-full flex items-center justify-center p-4">
                                    <div className="w-full h-full flex items-center justify-center">
                                      <SeatMatrixPreview
                                        matrix={seatMatrix}
                                        seatTiers={seatTiers || []}
                                        className="justify-center scale-90 transform origin-center"
                                        floor={2}
                                        mode="bus"
                                        variant="default"
                                        seats={busSeats}
                                        onSeatClick={handleSeatClick}
                                        selectedSeatId={selectedSeatId}
                                        selectedSeats={selectedSeats}
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

                        {/* Legend Card */}
                        <div className="w-80">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Leyenda de Tipos de Asiento
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                  const colorClass =
                                    colors[index % colors.length];

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
                                          ${tier.basePrice.toString()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>

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

      {selectedSeat && (
        <EditSeatModal
          isOpen={isEditSeatModalOpen}
          onClose={() => {
            setIsEditSeatModalOpen(false);
            setSelectedSeatId(undefined);
            refetchBusSeats();
          }}
          seat={selectedSeat}
          seatTier={selectedSeatTier}
        />
      )}
    </>
  );
};
