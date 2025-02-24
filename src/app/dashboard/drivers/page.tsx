"use client";

import { useUserRoutes } from "@/hooks/useUserRoutes";
import { useState } from "react";
import { Driver, CreateDriverInput } from "@/types/driver.types";
import { DriversTable } from "@/components/drivers/drivers-table";
import { DriverDialog } from "@/components/drivers/driver-dialog";
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from "@/hooks/useDrivers";
import { useCompanies } from "@/hooks/useCompanies";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LoadingTable } from "@/components/table/loading-table";
import { PageHeader } from "@/components/ui/page-header";
import type { Company } from "@/types/company.types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function Drivers() {
    const { toast } = useToast();
    const { userData } = useUserRoutes();
    const { data: companies = [], isLoading: companiesLoading } = useCompanies();
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const { data: drivers = [], isLoading: driversLoading } = useDrivers(selectedCompany?.id);
    const createDriver = useCreateDriver();
    const updateDriver = useUpdateDriver();
    const deleteDriver = useDeleteDriver();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();

    const handleCreate = async (data: CreateDriverInput) => {
        try {
            console.log("Creating driver with data:", data);
            await createDriver.mutateAsync(data);
            setIsDialogOpen(false);
            toast({
                title: "Conductor creado",
                description: "El conductor ha sido creado exitosamente.",
            });
        } catch (error) {
            console.error("Error creating driver:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al crear el conductor",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsDialogOpen(true);
    };

    const handleUpdate = async (data: CreateDriverInput) => {
        if (!selectedDriver) return;

        try {
            await updateDriver.mutateAsync({
                id: selectedDriver.id,
                data: {
                    ...data,
                    active: selectedDriver.active,
                },
            });
            setIsDialogOpen(false);
            toast({
                title: "Conductor actualizado",
                description: "El conductor ha sido actualizado exitosamente.",
            });
        } catch (error) {
            console.error("Error updating driver:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al actualizar el conductor",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (driverId: string) => {
        try {
            await deleteDriver.mutateAsync(driverId);
            toast({
                title: "Conductor eliminado",
                description: "El conductor ha sido eliminado exitosamente.",
            });
        } catch (error) {
            console.error("Error deleting driver:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al eliminar el conductor",
                variant: "destructive",
            });
        }
    };

    if (companiesLoading || driversLoading) {
        return <LoadingTable columnCount={6} rowCount={10} />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Conductores"
                description="Gestiona los conductores de tu empresa"
            />

            <div className="flex justify-between items-center">
                <div className="w-[200px]">
                    <Select
                        value={selectedCompany?.id || ""}
                        onValueChange={(value) => {
                            const company = companies.find(c => c.id === value);
                            setSelectedCompany(company || null);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una empresa" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={() => {
                    setSelectedDriver(undefined);
                    setIsDialogOpen(true);
                }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Conductor
                </Button>
            </div>

            <DriversTable
                drivers={drivers}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <DriverDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSubmit={selectedDriver ? handleUpdate : handleCreate}
                driver={selectedDriver}
                companies={companies}
                defaultCompanyId={selectedCompany?.id}
            />
        </div>
    );
} 