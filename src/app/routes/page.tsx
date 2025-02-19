'use client'
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RoutesTable } from "@/components/routes/routes-table";
import { Schedule } from "@/types/route.types";
import { Bus } from "@/types/bus.types";
import { AssignBusDialog } from "@/components/assign-bus-dialog";
import { useLocations } from "@/hooks/useLocations";

export default function RoutesPage() {
    const { toast } = useToast();
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [availableBuses, setAvailableBuses] = useState<Bus[]>([]);
    const { data: locations = [] } = useLocations();

    const handleGenerateSchedules = async (
        routeId: string,
        startDate: Date,
        endDate: Date
    ) => {
        try {
            const response = await fetch(`/api/routes/${routeId}/schedules/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Error al generar horarios");
            }

            const data = await response.json();
            toast({
                title: "Horarios generados",
                description: `Se han generado ${data.length} horarios exitosamente`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al generar horarios",
                variant: "destructive",
            });
        }
    };

    const handleAssignBus = async (scheduleId: string) => {
        try {
            // Obtener el horario
            const scheduleResponse = await fetch(`/api/schedules/${scheduleId}`);
            if (!scheduleResponse.ok) {
                throw new Error("Error al obtener el horario");
            }
            const schedule = await scheduleResponse.json();
            setSelectedSchedule(schedule);

            // Obtener buses disponibles
            const busesResponse = await fetch(`/api/buses/available?scheduleId=${scheduleId}`);
            if (!busesResponse.ok) {
                throw new Error("Error al obtener buses disponibles");
            }
            const buses = await busesResponse.json();
            setAvailableBuses(buses);

            // Abrir el diálogo
            setIsAssignDialogOpen(true);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al preparar asignación",
                variant: "destructive",
            });
        }
    };

    const handleConfirmAssignment = async (busId: string) => {
        if (!selectedSchedule) return;

        try {
            const startTime = new Date(selectedSchedule.departureDate);
            const endTime = new Date(selectedSchedule.estimatedArrivalTime);

            const response = await fetch("/api/bus-assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    busId,
                    routeId: selectedSchedule.routeId,
                    scheduleId: selectedSchedule.id,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Error al asignar bus");
            }

            await response.json();
        } catch (error) {
            throw new Error(
                error instanceof Error ? error.message : "Error al asignar bus"
            );
        }
    };

    return (
        <div className="container mx-auto py-10">
            <RoutesTable
                routes={[]} // TODO: Obtener rutas
                locations={locations}
                onRouteSelect={() => { }} // TODO: Implementar selección de ruta
                companyId="" // TODO: Obtener ID de la compañía
                onGenerateSchedules={handleGenerateSchedules}
                onAssignBus={handleAssignBus}
            />

            {selectedSchedule && (
                <AssignBusDialog
                    open={isAssignDialogOpen}
                    onOpenChange={setIsAssignDialogOpen}
                    schedule={selectedSchedule}
                    availableBuses={availableBuses}
                    onAssign={handleConfirmAssignment}
                />
            )}
        </div>
    );
} 