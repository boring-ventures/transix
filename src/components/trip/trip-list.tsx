"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSchedules, usePassengerList } from "@/hooks/useTrips";
import { Schedule } from "@/types/route.types";
import { Eye } from "lucide-react";
import { schedule_status_enum } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PassengerList } from "./passenger-list";
import { TripSettlementForm } from "./trip-settlement-form";

export function TripList() {
    const { data: schedules, isLoading } = useSchedules();
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const { data: passengers, isLoading: isLoadingPassengers } = usePassengerList(
        selectedSchedule?.id || ""
    );

    const getStatusColor = (status: schedule_status_enum) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-500";
            case "in_progress":
                return "bg-yellow-500";
            case "completed":
                return "bg-green-500";
            case "cancelled":
                return "bg-red-500";
            case "delayed":
                return "bg-orange-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusText = (status: schedule_status_enum) => {
        switch (status) {
            case "scheduled":
                return "Programado";
            case "in_progress":
                return "En Progreso";
            case "completed":
                return "Completado";
            case "cancelled":
                return "Cancelado";
            case "delayed":
                return "Retrasado";
            default:
                return "Desconocido";
        }
    };

    const handleViewDetails = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
        setIsDetailsOpen(true);
    };

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ruta</TableHead>
                            <TableHead>Fecha de Salida</TableHead>
                            <TableHead>Hora Estimada de Llegada</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Bus</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules?.map((schedule: Schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell>{schedule.route?.name}</TableCell>
                                <TableCell>
                                    {format(new Date(schedule.departureDate), "PPP", {
                                        locale: es,
                                    })}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(schedule.estimatedArrivalTime), "p", {
                                        locale: es,
                                    })}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={getStatusColor(schedule.status)}
                                        variant="secondary"
                                    >
                                        {getStatusText(schedule.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {schedule.bus ? (
                                        <Badge>{schedule.bus.plateNumber}</Badge>
                                    ) : (
                                        console.log(schedule),
                                        <span className="text-gray-400 italic">No asignado</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleViewDetails(schedule)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-[90%] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Viaje: {selectedSchedule?.route?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSchedule && (
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="details" className="flex-1">Detalles del Viaje</TabsTrigger>
                                <TabsTrigger value="settlement" className="flex-1">Liquidación</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="mt-4">
                                {isLoadingPassengers ? (
                                    <div>Cargando pasajeros...</div>
                                ) : (
                                    <PassengerList
                                        schedule={selectedSchedule}
                                        passengers={passengers || []}
                                    />
                                )}
                            </TabsContent>

                            <TabsContent value="settlement" className="mt-4">
                                <TripSettlementForm
                                    scheduleId={selectedSchedule.id}
                                    schedule={selectedSchedule}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
} 