"use client";

import { useState } from "react";
import {
  useBuses,
  useCreateBus,
  useUpdateBus,
  useDeleteBus,
} from "@/hooks/useBuses";
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
  UpdateBusInput,
  createBusSchema,
  updateBusSchema,
  MaintenanceStatusLabel,
} from "@/types/bus.types";
import { maintenanceStatusEnum } from "@/db/schema";
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

export default function BusesPage() {
  const { data: buses, isLoading: busesLoading } = useBuses();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const createBus = useCreateBus();
  const updateBus = useUpdateBus();
  const deleteBus = useDeleteBus();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusWithRelations | null>(null);
  const [deletingBus, setDeletingBus] = useState<BusWithRelations | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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

  const editForm = useForm<UpdateBusInput>({
    resolver: zodResolver(updateBusSchema),
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
      accessorKey: "template",
      header: "Plantilla",
      cell: ({ row }) => {
        if (!row.template) {
          return <span className="text-gray-400 italic">Sin plantilla</span>;
        }
        return row.template.name;
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
            {maintenanceStatusLabels[status]}
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
        return (
          <button
            className="cursor-pointer underline text-pink-600"
            onClick={() => handleOpenCompanyModal(row.company as Company)}
          >
            {row.company.name}
          </button>
        );
      },
    },
  ];

  const handleEdit = (bus: BusWithRelations) => {
    setEditingBus(bus);
    editForm.reset({
      plateNumber: bus.plateNumber,
      templateId: bus.templateId,
      maintenanceStatus: bus.maintenanceStatus || "active",
      companyId: bus.companyId || "",
      isActive: bus.isActive || true,
    });
    setIsEditOpen(true);
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
        title: "Bus eliminado",
        description: "El bus ha sido eliminado exitosamente.",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Hubo un error al eliminar el bus.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (formData: UpdateBusInput) => {
    if (!editingBus) return;

    try {
      await updateBus.mutateAsync({
        id: editingBus.id,
        data: formData,
      });
      setIsEditOpen(false);
      setEditingBus(null);
      toast({
        title: "Bus actualizado",
        description: "El bus ha sido actualizado exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al actualizar el bus.",
        variant: "destructive",
      });
    }
  };

  const onCreateSubmit = async (formData: CreateBusInput) => {
    try {
      await createBus.mutateAsync(formData);
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Bus creado",
        description: "El bus ha sido creado exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al crear el bus.",
        variant: "destructive",
      });
    }
  };

  if (busesLoading || companiesLoading) {
    return <LoadingTable columnCount={5} rowCount={10} />;
  }

  return (
    <div className="space-y-6">
      {/* Create Bus Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Bus</DialogTitle>
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plantilla</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* TODO: Add templates list */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
                        {maintenanceStatusEnum.enumValues.map((status) => (
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
              <Button type="submit" disabled={createBus.isPending}>
                Crear Bus
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Bus Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Bus</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                control={editForm.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plantilla</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar plantilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* TODO: Add templates list */}
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
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceStatusEnum.enumValues.map((status) => (
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
              <Button type="submit" disabled={updateBus.isPending}>
                Actualizar Bus
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
        description="Gestiona los buses del sistema."
        data={buses || []}
        columns={columns}
        searchable
        searchField="plateNumber"
        onAdd={() => setIsCreateOpen(true)}
        onEdit={(bus: BusWithRelations) => handleEdit(bus)}
        onDelete={(bus: BusWithRelations) => handleDelete(bus)}
      />
    </div>
  );
}
