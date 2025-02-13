"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocations } from "@/hooks/useLocations";
import { CreateLocationDialog } from "@/components/locations/create-location-dialog";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { LoadingTable } from "@/components/table/loading-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

const locationSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
});

type LocationFormData = z.infer<typeof locationSchema>;

type LocationRow = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export default function LocationsPage() {
    const { data: locations = [], isLoading } = useLocations();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingLocation, setEditingLocation] = useState<LocationRow | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<LocationRow | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const editForm = useForm<LocationFormData>({
        resolver: zodResolver(locationSchema),
        defaultValues: {
            name: "",
        },
    });

    const handleEdit = (location: Record<string, unknown>) => {
        const locationData = {
            id: location.id as string,
            name: location.name as string,
            createdAt: location.createdAt as string,
            updatedAt: location.updatedAt as string,
        };

        setEditingLocation(locationData);
        editForm.reset({ name: locationData.name });
        setIsEditOpen(true);
    };

    const handleDelete = (location: Record<string, unknown>) => {
        const locationData = {
            id: location.id as string,
            name: location.name as string,
            createdAt: location.createdAt as string,
            updatedAt: location.updatedAt as string,
        };

        setDeletingLocation(locationData);
        setIsDeleteOpen(true);
    };

    const onEditSubmit = async (data: LocationFormData) => {
        if (!editingLocation) return;

        try {
            const response = await fetch(`/api/locations/${editingLocation.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Error al actualizar la ubicación");

            await queryClient.invalidateQueries({ queryKey: ["locations"] });

            setIsEditOpen(false);
            setEditingLocation(null);
            editForm.reset();
            toast({
                title: "Éxito",
                description: "Ubicación actualizada correctamente",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo actualizar la ubicación",
                variant: "destructive",
            });
        }
    };

    const confirmDelete = async () => {
        if (!deletingLocation) return;

        try {
            const response = await fetch(`/api/locations/${deletingLocation.id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Error al eliminar la ubicación");

            setIsDeleteOpen(false);
            setDeletingLocation(null);
            toast({
                title: "Éxito",
                description: "Ubicación eliminada correctamente",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la ubicación",
                variant: "destructive",
            });
        }
    };

    const handleCreateLocation = async (name: string) => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "El nombre de la ubicación es requerido",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!response.ok) throw new Error("Error al crear la ubicación");

            await queryClient.invalidateQueries({ queryKey: ["locations"] });

            toast({
                title: "Éxito",
                description: "Ubicación creada correctamente",
            });
            setIsCreateOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo crear la ubicación",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns: Column<Record<string, unknown>>[] = [
        {
            id: "id",
            accessorKey: "id",
            header: "ID",
            sortable: true,
            cell: ({ row }) => {
                const data = row as unknown as LocationRow;
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
                const data = row as unknown as LocationRow;
                return <div className="font-medium min-w-[200px]">{data.name}</div>;
            },
        },
        {
            id: "createdAt",
            accessorKey: "createdAt",
            header: "Fecha de Creación",
            sortable: true,
            cell: ({ row }) => {
                const data = row as unknown as LocationRow;
                return data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "N/A";
            },
        },
    ];

    if (isLoading) return <LoadingTable columnCount={3} rowCount={10} />;

    const tableData = locations.map(location => ({
        id: location.id,
        name: location.name,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt
    }));

    return (
        <div className="space-y-6">
            <CreateLocationDialog 
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={handleCreateLocation}
                isSubmitting={isSubmitting}
            />

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Ubicación</DialogTitle>
                        <DialogDescription>
                            Editando ubicación: <span className="font-mono">{editingLocation?.id}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nombre de la ubicación" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Actualizar Ubicación</Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar Ubicación</DialogTitle>
                        <DialogDescription>
                            ¿Está seguro que desea eliminar la ubicación &ldquo;{deletingLocation?.name}&rdquo;? 
                            Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DataTable
                title="Ubicaciones"
                description="Gestiona las ubicaciones disponibles para las rutas."
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