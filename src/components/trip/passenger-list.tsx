"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PassengerList as PassengerListType } from "@/types/trip.types";
import type { Schedule } from "@/types/route.types";
import type { passenger_status_enum } from "@prisma/client";
import { useState } from "react";
import { ReservationPDF } from "@/components/tickets/reservation-pdf";

interface PassengerListProps {
    passengers: PassengerListType[];
    schedule: Schedule;
}

export function PassengerList({ passengers, schedule }: PassengerListProps) {
    const getStatusColor = (status: passenger_status_enum) => {
        switch (status) {
            case "confirmed":
                return "bg-green-500";
            case "cancelled":
                return "bg-red-500";
            case "no_show":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusText = (status: passenger_status_enum) => {
        switch (status) {
            case "confirmed":
                return "Confirmado";
            case "cancelled":
                return "Cancelado";
            case "no_show":
                return "No se Presentó";
            default:
                return "Desconocido";
        }
    };

    const [showPDF, setShowPDF] = useState(false);

    const reservation = {
        reservationId: "N/A",
        schedule: {
            departureDate: format(new Date(schedule.departureDate), "dd/MM/yyyy"),
            departureTime: format(new Date(schedule.departureDate), "HH:mm"),
            route: schedule.route?.name || "Flota",
        },
        tickets: passengers.map((passenger) => ({
            seatNumber: passenger.seatNumber || "-",
            passengerName: passenger.fullName,
            documentId: passenger.documentId || "NO PORTA",
            price: 0,
        })),
        totalAmount: 0,
        purchaseTime: "",
    };

    return (
        <div className="space-y-6">
            {/* Versión imprimible */}
            <div className="hidden print:block space-y-4">
                <div className="text-center uppercase">
                    <h1 className="text-xl font-bold">
                        {schedule.route?.name || "Flota"}
                    </h1>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><strong>SALIDA:</strong> {schedule.route?.name}</p>
                        <p><strong>HORA:</strong> {format(new Date(schedule.departureDate), "HH:mm")}</p>
                        <p><strong>CARRIL:</strong> {schedule.route?.departureLane}</p>
                        <p><strong>BUS MARCA:</strong> {schedule.bus?.template?.name}</p>
                        <p><strong>PLACA:</strong> {schedule.bus?.plateNumber}</p>
                    </div>
                    <div>
                        <p><strong>CONDUCTOR:</strong> {schedule.primaryDriver?.fullName}</p>
                        <p><strong>LIC:</strong> {schedule.primaryDriver?.licenseNumber} CAT: {schedule.primaryDriver?.licenseCategory}</p>
                        {schedule.secondaryDriver && (
                            <>
                                <p><strong>CONDUCTOR:</strong> {schedule.secondaryDriver.fullName}</p>
                                <p><strong>LIC:</strong> {schedule.secondaryDriver.licenseNumber} CAT: {schedule.secondaryDriver.licenseCategory}</p>
                            </>
                        )}
                        <p><strong>FECHA:</strong> {format(new Date(schedule.departureDate), "dd/MM/yyyy")}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-center font-bold mb-4">LISTA DE PASAJEROS</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">Nro.</TableHead>
                                <TableHead>NOMBRE COMPLETO</TableHead>
                                <TableHead className="w-32">NUMERO C.I.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {passengers.map((passenger, index) => (
                                <TableRow key={passenger.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{passenger.fullName}</TableCell>
                                    <TableCell>{passenger.documentId || "NO PORTA"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Versión para pantalla */}
            <div className="print:hidden">
                <Card>
                    <CardContent className="pt-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asiento</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Documento</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {passengers.map((passenger) => (
                                        <TableRow key={passenger.id}>
                                            <TableCell>{passenger.seatNumber}</TableCell>
                                            <TableCell>{passenger.fullName}</TableCell>
                                            <TableCell>{passenger.documentId || "-"}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getStatusColor(passenger.status)}
                                                    variant="secondary"
                                                >
                                                    {getStatusText(passenger.status)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="text-center print:hidden">
                <button
                    type="button"
                    onClick={() => setShowPDF(!showPDF)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    {showPDF ? "Ocultar PDF" : "Generar PDF"}
                </button>
                {showPDF && (
                    <div className="mt-4">
                        <ReservationPDF reservation={reservation} />
                    </div>
                )}
            </div>
        </div>
    );
} 