"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
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
  // Se elimina el estado con datos estáticos
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Se realiza el fetch de datos a nuestro endpoint del API
  useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch("/api/tickets");
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        } else {
          console.error("Error al obtener los tickets:", response.statusText);
        }
      } catch (error) {
        console.error("Error al obtener los tickets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const columns: Column<TicketWithDetails>[] = [
    {
      id: "passengerName",
      accessorKey: "passengerName",
      header: "Pasajero",
      sortable: true,
    },
    {
      id: "route",
      accessorKey: "route" as keyof TicketWithDetails,
      header: "Ruta",
      cell: ({ row }) => row.route.name,
      sortable: true,
    },
    {
      id: "seatNumber",
      accessorKey: "seatNumber",
      header: "Asiento",
      sortable: true,
    },
    {
      id: "departureDate",
      accessorKey: "schedule" as keyof TicketWithDetails,
      header: "Fecha",
      cell: ({ row }) => row.schedule.departureDate,
      sortable: true,
    },
    {
      id: "departureTime",
      accessorKey: "schedule" as keyof TicketWithDetails,
      header: "Hora",
      cell: ({ row }) => row.schedule.departureTime,
      sortable: true,
    },
    {
      id: "price",
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => `Bs. ${row.price}`,
      sortable: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Estado",
      sortable: true,
      cell: ({ row }) => {
        const status = row.status;
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

  // Se muestra un estado de carga mientras se obtienen los datos
  if (loading) {
    return (
      <div>
        <p>Cargando tickets...</p>
      </div>
    );
  }

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

      <DataTable
        title="Tickets Vendidos"
        data={tickets}
        columns={columns}
        searchable={true}
        searchField="passengerName"
      />
    </div>
  );
}
