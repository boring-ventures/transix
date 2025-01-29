"use client";

import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
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
  CreateBusTypeTemplateInput,
  createBusTypeTemplateSchema,
} from "@/types/bus.types";
import { useForm } from "react-hook-form";
import { LoadingTable } from "@/components/table/loading-table";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateBusTemplate, useBusTemplates } from "@/hooks/useBusTemplates";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import { SeatEditor } from "@/components/bus/seat-editor";
import { SeatTierManager } from "@/components/bus/seat-tier-manager";

export default function BusTemplatesPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: seatTiers, isLoading: seatTiersLoading } = useSeatTiers();
  const { data: templates, isLoading: templatesLoading } = useBusTemplates();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const createForm = useForm<CreateBusTypeTemplateInput>({
    resolver: zodResolver(createBusTypeTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: "",
      totalCapacity: 0,
      seatTemplateMatrix: {
        firstFloor: Array(4).fill(Array(4).fill("")),
      },
      seatTiers: [],
      isActive: true,
    },
  });

  const columns: Column<BusTypeTemplate>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      sortable: true,
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Descripción",
    },
    {
      id: "totalCapacity",
      accessorKey: "totalCapacity",
      header: "Capacidad Total",
      sortable: true,
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const calculateTotalCapacity = (seatMatrix: {
    firstFloor: string[][];
    secondFloor?: string[][];
  }) => {
    const firstFloorCapacity = seatMatrix.firstFloor.reduce(
      (acc, row) => acc + row.length,
      0
    );
    const secondFloorCapacity =
      seatMatrix.secondFloor?.reduce((acc, row) => acc + row.length, 0) || 0;
    return firstFloorCapacity + secondFloorCapacity;
  };

  const createBusTemplate = useCreateBusTemplate();

  const onCreateSubmit = async (formData: CreateBusTypeTemplateInput) => {
    try {
      await createBusTemplate.mutateAsync(formData);
      setIsCreateOpen(false);
      createForm.reset();
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

  if (companiesLoading || seatTiersLoading || templatesLoading) {
    return <LoadingTable columnCount={4} rowCount={10} />;
  }

  return (
    <div className="space-y-6">
      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Crear Plantilla de Bus</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
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
                            onChange={field.onChange}
                            existingTiers={seatTiers || []}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Right Column - Seat Configuration */}
                <div>
                  <FormField
                    control={createForm.control}
                    name="seatTemplateMatrix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Configuración de Asientos</FormLabel>
                        <FormControl>
                          <SeatEditor
                            value={field.value}
                            onChange={(newMatrix) => {
                              field.onChange(newMatrix);
                              setTimeout(() => {
                                createForm.setValue(
                                  "totalCapacity",
                                  calculateTotalCapacity(newMatrix)
                                );
                              }, 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Plantilla</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Plantillas de Bus"
        description="Gestiona las plantillas de configuración de buses."
        data={templates || []}
        columns={columns}
        searchable
        searchField="name"
        onAdd={() => setIsCreateOpen(true)}
      />
    </div>
  );
}
