"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type TicketWithDetails = {
  id: string;
  routeId: string;
  scheduleId: string;
  seatNumber: string;
  seatTier: string;
  passengerName: string;
  passengerCI: string;
  price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
  route: {
    name: string;
    origin: string;
    destination: string;
  };
  schedule: {
    departureDate: string;
    departureTime: string;
  };
};

export default function TicketList() {
  // Mock data - this would come from local storage in production
  const [tickets] = useState<TicketWithDetails[]>([
    {
      id: "1",
      routeId: "1",
      scheduleId: "1",
      seatNumber: "A1",
      seatTier: "economy",
      passengerName: "Juan Pérez",
      passengerCI: "1234567",
      price: 50,
      status: "confirmed",
      createdAt: new Date(),
      updatedAt: new Date(),
      route: {
        name: "La Paz - Santa Cruz",
        origin: "La Paz",
        destination: "Santa Cruz",
      },
      schedule: {
        departureDate: "2024-01-20",
        departureTime: "08:00",
      },
    },
    {
      id: "2",
      routeId: "1",
      scheduleId: "2",
      seatNumber: "B2",
      seatTier: "business",
      passengerName: "María García",
      passengerCI: "7654321",
      price: 75,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      route: {
        name: "La Paz - Santa Cruz",
        origin: "La Paz",
        destination: "Santa Cruz",
      },
      schedule: {
        departureDate: "2024-01-20",
        departureTime: "14:00",
      },
    },
  ]);

  const columns: Column<TicketWithDetails>[] = [
    { id: "passengerName", accessorKey: "passengerName", header: "Pasajero" },
    {
      id: "route",
      accessorKey: "route",
      header: "Ruta",
      cell: ({ row }) => row.route.name,
    },
    { id: "seatNumber", accessorKey: "seatNumber", header: "Asiento" },
    {
      id: "departureDate",
      accessorKey: "schedule.departureDate",
      header: "Fecha",
    },
    {
      id: "departureTime",
      accessorKey: "schedule.departureTime",
      header: "Hora",
    },
    {
      id: "price",
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => `Bs. ${row.price}`,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.status as TicketWithDetails["status"];
        return (
          <Badge
            variant={
              status === "confirmed"
                ? "default"
                : status === "pending"
                ? "secondary"
                : status === "cancelled"
                ? "destructive"
                : "outline"
            }
          >
            {status === "confirmed"
              ? "Confirmado"
              : status === "pending"
              ? "Pendiente"
              : status === "cancelled"
              ? "Cancelado"
              : "Completado"}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lista de Tickets</h1>
        <p className="text-muted-foreground">
          Visualice y gestione todos los tickets vendidos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Bs. {tickets.reduce((sum, ticket) => sum + ticket.price, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Tickets Confirmados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter((t) => t.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tickets} />
        </CardContent>
      </Card>
    </div>
  );
}
