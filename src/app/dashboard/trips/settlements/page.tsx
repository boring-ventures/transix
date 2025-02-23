"use client";

import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSchedules } from "@/hooks/useSchedules";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

export default function SettlementsPage() {
    const router = useRouter();
    const { data: schedules, isLoading } = useSchedules();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Liquidaciones"
                description="Gestión de liquidaciones de viajes"
            />

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Liquidaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ruta</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Bus</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules?.map((schedule) => (
                                <TableRow key={schedule.id}>
                                    <TableCell>{schedule.route?.name}</TableCell>
                                    <TableCell>
                                        {format(new Date(schedule.departureDate), "PPP", {
                                            locale: es,
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {schedule.bus?.plateNumber || "No asignado"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {schedule.status === "completed" ? "Completado" : "Pendiente"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() =>
                                                router.push(`/dashboard/trips/${schedule.id}/settlement`)
                                            }
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
} 