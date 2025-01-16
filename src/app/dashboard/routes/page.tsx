"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Location,
  Route,
  Schedule,
  CreateRouteInput,
} from "@/types/route.types";

export default function Routes() {
  // Mock locations data
  const locations: Location[] = [
    { id: "1", name: "La Paz", createdAt: new Date(), updatedAt: new Date() },
    {
      id: "2",
      name: "Santa Cruz",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "Cochabamba",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    { id: "4", name: "Sucre", createdAt: new Date(), updatedAt: new Date() },
  ];

  const [routes, setRoutes] = useState<Route[]>([
    {
      id: "1",
      name: "La Paz - Santa Cruz",
      originId: "1",
      destinationId: "2",
      capacity: 40,
      seatsTaken: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Cochabamba - Sucre",
      originId: "3",
      destinationId: "4",
      capacity: 35,
      seatsTaken: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: "1",
      routeId: "1",
      busId: "1",
      departureDate: "2024-01-15",
      departureTime: "09:00",
      price: 150,
      capacity: 40,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      routeId: "2",
      busId: "2",
      departureDate: "2024-01-15",
      departureTime: "10:00",
      price: 100,
      capacity: 35,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [newRoute, setNewRoute] = useState<CreateRouteInput>({
    name: "",
    originId: "",
    destinationId: "",
    capacity: 0,
  });

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRoutes((prev) => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        ...newRoute,
        seatsTaken: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    setNewRoute({ name: "", originId: "", destinationId: "", capacity: 0 });
  };

  const getLocationName = (id: string) => {
    return locations.find((loc) => loc.id === id)?.name || "";
  };

  const routeColumns: Column<Route>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      sortable: true,
    },
    {
      id: "origin",
      accessorKey: "originId",
      header: "Origen",
      cell: ({ row }) => getLocationName(row.originId),
      sortable: true,
    },
    {
      id: "destination",
      accessorKey: "destinationId",
      header: "Destino",
      cell: ({ row }) => getLocationName(row.destinationId),
      sortable: true,
    },
    {
      id: "capacity",
      accessorKey: "capacity",
      header: "Capacidad",
      sortable: true,
    },
    {
      id: "seatsTaken",
      accessorKey: "seatsTaken",
      header: "Asientos Ocupados",
      sortable: true,
    },
  ];

  const scheduleColumns: Column<Schedule>[] = [
    {
      id: "route",
      accessorKey: "routeId",
      header: "Ruta",
      cell: ({ row }) => routes.find((r) => r.id === row.routeId)?.name || "",
      sortable: true,
    },
    {
      id: "departureDate",
      accessorKey: "departureDate",
      header: "Fecha",
      sortable: true,
    },
    {
      id: "departureTime",
      accessorKey: "departureTime",
      header: "Hora",
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
      id: "capacity",
      accessorKey: "capacity",
      header: "Capacidad",
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rutas</h1>
          <p className="text-muted-foreground">Gestión de rutas y horarios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Rutas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Capacidad Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routes.reduce((acc, curr) => acc + curr.capacity, 0)} asientos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Horarios Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Ruta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRouteSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Ruta</Label>
                <Input
                  id="name"
                  name="name"
                  value={newRoute.name}
                  onChange={(e) =>
                    setNewRoute((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: La Paz - Santa Cruz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidad</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={newRoute.capacity || ""}
                  onChange={(e) =>
                    setNewRoute((prev) => ({
                      ...prev,
                      capacity: parseInt(e.target.value),
                    }))
                  }
                  placeholder="Capacidad total"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin">Origen</Label>
                <Select
                  value={newRoute.originId}
                  onValueChange={(value) =>
                    setNewRoute((prev) => ({ ...prev, originId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Select
                  value={newRoute.destinationId}
                  onValueChange={(value) =>
                    setNewRoute((prev) => ({ ...prev, destinationId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit">Crear Ruta</Button>
          </form>
        </CardContent>
      </Card>

      <DataTable
        title="Rutas Disponibles"
        data={routes}
        columns={routeColumns}
        searchable={true}
        searchField="name"
      />

      <DataTable
        title="Horarios"
        data={schedules}
        columns={scheduleColumns}
        searchable={true}
        searchField="routeId"
      />
    </div>
  );
}
