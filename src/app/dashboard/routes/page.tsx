"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CreateScheduleInput,
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

  const [newSchedule, setNewSchedule] = useState<CreateScheduleInput>({
    routeId: "",
    busId: "",
    departureDate: "",
    departureTime: "",
    price: 0,
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

      <Card>
        <CardHeader>
          <CardTitle>Rutas Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Asientos Ocupados</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.name}</TableCell>
                  <TableCell>{getLocationName(route.originId)}</TableCell>
                  <TableCell>{getLocationName(route.destinationId)}</TableCell>
                  <TableCell>{route.capacity}</TableCell>
                  <TableCell>{route.seatsTaken}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ruta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    {routes.find((r) => r.id === schedule.routeId)?.name}
                  </TableCell>
                  <TableCell>{schedule.departureDate}</TableCell>
                  <TableCell>{schedule.departureTime}</TableCell>
                  <TableCell>Bs. {schedule.price}</TableCell>
                  <TableCell>{schedule.capacity}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Editar
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
