"use client";

import { useState, useEffect } from "react";
import { useBuses, useCreateBus, useDeleteBus } from "@/hooks/useBuses";
import { useCompanies } from "@/hooks/useCompanies";
import { useBusTemplates } from "@/hooks/useBusTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  CreateBusInput,
  createBusSchema,
  MaintenanceStatusLabel,
} from "@/types/bus.types";
import { maintenance_status_enum } from "@prisma/client";
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
import type { Company } from "@/types/company.types";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { EditBusModal } from "@/components/bus/edit-bus-modal";

export default function BusesPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Seleccionar la primera empresa por defecto
  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0]);
    }
  }, [companies, selectedCompany]);

  const { data: buses, isLoading: busesLoading } = useBuses(selectedCompany?.id);
  const { data: templates, isLoading: templatesLoading } = useBusTemplates();
  const createBus = useCreateBus();
  const deleteBus = useDeleteBus();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusWithRelations | null>(null);
  const [deletingBus, setDeletingBus] = useState<BusWithRelations | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const { toast } = useToast();

  const createForm = useForm<CreateBusInput>({
    resolver: zodResolver(createBusSchema),
    defaultValues: {
      plateNumber: "",
      templateId: "",
      companyId: "",
      maintenanceStatus: "active",
      isActive: true,
    },
  });

  const maintenanceStatusLabels: MaintenanceStatusLabel = {
    active: "Activo",
    in_maintenance: "En Mantenimiento",
    retired: "Retirado",
  };

  const maintenanceStatusColors: Record<string, { bg: string; text: string }> =
    {
      active: { bg: "bg-green-100", text: "text-green-800" },
      in_maintenance: { bg: "bg-yellow-100", text: "text-yellow-800" },
      retired: { bg: "bg-red-100", text: "text-red-800" },
    };

  const handleOpenCompanyModal = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyModalOpen(true);
  };

  const handleDelete = (bus: BusWithRelations) => {
    setDeletingBus(bus);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBus) return;

    try {
      await deleteBus.mutateAsync(deletingBus.id);
      setIsDeleteOpen(false);
      setDeletingBus(null);
      toast({
        title: "Bus desactivado",
        description: "El bus ha sido desactivado exitosamente.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al desactivar el bus.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onCreateSubmit = async (formData: CreateBusInput) => {
    try {
      // Validación adicional antes de enviar
      if (!formData.companyId || !formData.templateId || !formData.plateNumber) {
        toast({
          title: "Error de validación",
          description: "Todos los campos son requeridos",
          variant: "destructive",
        });
        return;
      }

      // Validar formato de UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(formData.companyId)) {
        toast({
          title: "Error de validación",
          description: "ID de empresa inválido",
          variant: "destructive",
        });
        return;
      }

      if (!uuidRegex.test(formData.templateId)) {
        toast({
          title: "Error de validación",
          description: "ID de plantilla inválido",
          variant: "destructive",
        });
        return;
      }

      // Validar que la placa no esté vacía después de quitar espacios
      const trimmedPlateNumber = formData.plateNumber.trim();
      if (!trimmedPlateNumber) {
        toast({
          title: "Error de validación",
          description: "La placa no puede estar vacía",
          variant: "destructive",
        });
        return;
      }

      // Validar formato de placa (opcional, ajusta según tus necesidades)
      const plateRegex = /^[A-Z0-9-]+$/;
      if (!plateRegex.test(trimmedPlateNumber)) {
        toast({
          title: "Error de validación",
          description: "Formato de placa inválido. Use solo letras mayúsculas, números y guiones",
          variant: "destructive",
        });
        return;
      }

      // Actualizar la placa sin espacios y en mayúsculas
      const dataToSend = {
        ...formData,
        plateNumber: trimmedPlateNumber.toUpperCase(),
      };

      await createBus.mutateAsync(dataToSend);
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Bus creado",
        description: "El bus ha sido creado exitosamente.",
      });
    } catch (error) {
      console.error("Error creating bus:", error);
      const errorMessage = error instanceof Error ? error.message : "Hubo un error al crear el bus";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const columns: Column<BusWithRelations>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      sortable: true,
      cell: ({ row }) => {
        return (
          <span className="font-mono text-[10px] text-muted-foreground truncate w-20 inline-block">
            {row.id.slice(0, 8)}...
          </span>
        );
      },
    },
    {
      id: "plateNumber",
      accessorKey: "plateNumber",
      header: "Placa",
      sortable: true,
    },
    {
      id: "template",
      accessorKey: "bus_type_templates",
      header: "Plantilla",
      cell: ({ row }) => {
        if (!row.bus_type_templates) {
          return <span className="text-gray-400 italic">Sin plantilla</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            <span>{row.template?.name}</span>
            <Badge variant="secondary" className="w-fit">
              {row.template?.totalCapacity} asientos
            </Badge>
          </div>
        );
      },
    },
    {
      id: "maintenance",
      accessorKey: "maintenanceStatus",
      header: "Estado de Mantenimiento",
      sortable: true,
      cell: ({ row }) => {
        const status = row.maintenanceStatus || "active";
        const { bg, text } = maintenanceStatusColors[status];
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${bg} ${text}`}>
            {maintenanceStatusLabels[status as keyof MaintenanceStatusLabel]}
          </span>
        );
      },
    },
    {
      id: "company",
      accessorKey: "company",
      header: "Empresa",
      cell: ({ row }) => {
        if (!row.company) {
          return <span className="text-gray-400 italic">Sin empresa</span>;
        }
        const company: Company = row.company;
        return (
          <button
            className="cursor-pointer underline text-pink-600"
            onClick={() => handleOpenCompanyModal(company)}
          >
            {company.name}
          </button>
        );
      },
    },
  ];

  if (companiesLoading || (selectedCompany && busesLoading) || templatesLoading) {
    return <LoadingTable columnCount={5} rowCount={10} />;
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">No hay empresas registradas</h2>
        <p className="text-muted-foreground">
          Necesita registrar al menos una empresa antes de poder gestionar buses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select
            value={selectedCompany?.id || ""}
            onValueChange={(value) => {
              const company = companies?.find((c) => c.id === value);
              setSelectedCompany(company || null);
            }}
          >
            <SelectTrigger className="w-[200px]">
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
{/*           <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Bus
          </Button> */}
        </div>
      </div>

      {/* Create Bus Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Bus</DialogTitle>
            {(!templates || templates.length === 0) && (
              <DialogDescription>
                No hay plantillas disponibles.{" "}
                <Link
                  href="/dashboard/buses/templates"
                  className="text-primary hover:underline"
                >
                  Crear una plantilla
                </Link>{" "}
                antes de crear un bus.
              </DialogDescription>
            )}
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Limpiar la plantilla seleccionada cuando se cambia de empresa
                        createForm.setValue('templateId', '', { shouldValidate: true });
                      }} 
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
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Placa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="templateId"
                render={({ field }) => {
                  const selectedCompanyId = createForm.getValues('companyId');
                  const companyTemplates = templates?.filter(
                    template => template.companyId === selectedCompanyId
                  );
                  const hasTemplates = companyTemplates && companyTemplates.length > 0;

                  // Si no hay plantillas para la empresa seleccionada, asegurarse de que no haya ninguna plantilla seleccionada
                  if (!hasTemplates && field.value) {
                    createForm.setValue('templateId', '', { shouldValidate: true });
                  }

                  return (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Plantilla</FormLabel>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/dashboard/buses/templates"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Nueva plantilla
                          </Link>
                          {selectedCompanyId && !hasTemplates && (
                            <span className="text-xs text-muted-foreground">
                              (Esta empresa no tiene plantillas)
                            </span>
                          )}
                        </div>
                      </div>
                      <Select 
                        key={selectedCompanyId} // Forzar re-render cuando cambia la empresa
                        onValueChange={field.onChange} 
                        value={hasTemplates ? field.value : ""}
                        disabled={!hasTemplates}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plantilla" />
                        </SelectTrigger>
                        <SelectContent>
                          {companyTemplates?.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.totalCapacity} asientos)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={createForm.control}
                name="maintenanceStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Mantenimiento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(maintenance_status_enum).map((status: maintenance_status_enum) => (
                          <SelectItem key={status} value={status}>
                            {maintenanceStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  createBus.isPending || !templates || templates.length === 0
                }
              >
                Crear Bus
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Modal */}
      {editingBus && (
        <EditBusModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setEditingBus(null);
          }}
          bus={editingBus}
          companies={companies || []}
        />
      )}

      {/* Delete Bus Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Bus</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea desactivar este bus?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="submit"
              disabled={deleteBus.isPending}
              onClick={confirmDelete}
            >
              Desactivar Bus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Details Dialog */}
      <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la empresa</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-2">
              <p className="font-mono text-sm">ID: {selectedCompany.id}</p>
              <p>Nombre: {selectedCompany.name}</p>
              <p>¿Está activa?: {selectedCompany.active ? "Sí" : "No"}</p>
              <p>
                Fecha de creación:{" "}
                {new Date(selectedCompany.createdAt).toLocaleDateString()}
              </p>
              <p>
                Fecha de actualización:{" "}
                {new Date(selectedCompany.updatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsCompanyModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Buses"
        description={`Gestiona los buses de ${selectedCompany?.name || 'la empresa'}.`}
        data={buses || []}
        columns={columns}
        searchable
        searchField="plateNumber"
        onAdd={() => setIsCreateOpen(true)}
        onEdit={(bus: BusWithRelations) => {
          setEditingBus(bus);
          setIsEditOpen(true);
        }}
        onDelete={(bus: BusWithRelations) => handleDelete(bus)}
        noDataMessage={
          !selectedCompany
            ? "Seleccione una empresa para ver sus buses"
            : "No hay buses registrados para esta empresa"
        }
      />
    </div>
  );
}
