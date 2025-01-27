"use client";

import { useState } from "react";
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/table/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { CompanyResponse } from "@/types/company.types";
import { Column } from "@/components/table/types";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createCompanySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  active: z.boolean(),
});

type CompanyFormData = z.infer<typeof createCompanySchema>;

export default function CompaniesPage() {
  const { data: companies, isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyResponse | null>(
    null
  );
  const [deletingCompany, setDeletingCompany] =
    useState<CompanyResponse | null>(null);
  const { toast } = useToast();

  const createForm = useForm<CompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  const editForm = useForm<CompanyFormData>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      active: true,
    },
  });

  const onCreateSubmit = async (data: CompanyFormData) => {
    try {
      await createCompany.mutateAsync(data);
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Empresa creada",
        description: "La empresa ha sido creada exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al crear la empresa.",
        variant: "destructive",
      });
    }
  };

  const onEditSubmit = async (data: CompanyFormData) => {
    if (!editingCompany) return;

    try {
      await updateCompany.mutateAsync({
        companyId: editingCompany.id,
        data: data,
      });
      setIsEditOpen(false);
      setEditingCompany(null);
      editForm.reset();
      toast({
        title: "Empresa actualizada",
        description: "La empresa ha sido actualizada exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al actualizar la empresa.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (company: Record<string, unknown>) => {
    const id = company.id as string;
    const name = company.name as string;
    const active = company.active as boolean;
    const createdAt = new Date(company.createdAt as string);
    const updatedAt = new Date(company.updatedAt as string);

    setEditingCompany({
      id,
      name,
      active,
      createdAt,
      updatedAt,
    });

    editForm.reset({
      name,
      active,
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (company: Record<string, unknown>) => {
    const id = company.id as string;
    const name = company.name as string;
    const active = company.active as boolean;
    const createdAt = new Date(company.createdAt as string);
    const updatedAt = new Date(company.updatedAt as string);

    setDeletingCompany({
      id,
      name,
      active,
      createdAt,
      updatedAt,
    });
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCompany) return;

    try {
      await deleteCompany.mutateAsync(deletingCompany.id);
      setIsDeleteOpen(false);
      setDeletingCompany(null);
      toast({
        title: "Empresa desactivada",
        description: "La empresa ha sido desactivada exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al desactivar la empresa.",
        variant: "destructive",
      });
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as CompanyResponse;
        return (
          <span className="font-mono text-[10px] text-muted-foreground truncate w-20 inline-block">
            {data.id.slice(0, 8)}...
          </span>
        );
      },
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as CompanyResponse;
        return <div className="font-medium min-w-[200px]">{data.name}</div>;
      },
    },
    {
      id: "status",
      accessorKey: "active",
      header: "Estado",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as CompanyResponse;
        const active = data.active;
        return (
          <span
            className={`font-medium w-24 inline-block ${
              active ? "text-green-600" : "text-red-600"
            }`}
          >
            {active ? "Activo" : "Inactivo"}
          </span>
        );
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Fecha de Creación",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as CompanyResponse;
        return (
          <span className="text-muted-foreground w-36 inline-block">
            {new Date(data.createdAt).toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  if (isLoading) return <div className="p-4">Cargando...</div>;

  const tableData =
    companies
      ?.filter((company) => company.active)
      .map((company) => ({
        id: company.id,
        name: company.name,
        active: company.active,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">
            Gestión de empresas del sistema
          </p>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Empresa</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre de la empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createCompany.isPending}>
                Crear Empresa
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              ID: {editingCompany?.id}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre de la empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateCompany.isPending}>
                Actualizar Empresa
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Empresa</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea desactivar la empresa &ldquo;
              {deletingCompany?.name}&rdquo;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteCompany.isPending}
            >
              Desactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Lista de Empresas Activas"
        data={tableData}
        columns={columns}
        searchable={true}
        searchField="name"
        onAdd={() => setIsCreateOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
