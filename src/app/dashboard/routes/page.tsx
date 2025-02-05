"use client";

import { useState } from "react";
import { CreateRouteInput, Location, Route, Schedule } from "@/types/route.types";
import { RoutesStatsCards } from "@/components/routes/routes-stats-cards";
import { CreateRouteForm } from "@/components/routes/create-route-form";
import { RoutesTable } from "@/components/routes/routes-table";
import { SchedulesTable } from "@/components/routes/schedules-table";

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
      price: "150",
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
      price: "100",
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
    seatsTaken: 0,
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
    setNewRoute({
      name: "",
      originId: "",
      destinationId: "",
      capacity: 0,
      seatsTaken: 0,
    });
  };

  // Handles changes to the new route form
  const handleRouteChange = (updates: Partial<CreateRouteInput>) => {
    setNewRoute((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rutas</h1>
          <p className="text-muted-foreground">Gestión de rutas y horarios</p>
        </div>
      </div>

      {/* Stats Cards Component */}
      <RoutesStatsCards routes={routes} schedules={schedules} />

      {/* New Route Form Component */}
      <CreateRouteForm
        newRoute={newRoute}
        locations={locations}
        onSubmit={handleRouteSubmit}
        onRouteChange={handleRouteChange}
      />

      {/* Routes Table Component */}
      <RoutesTable routes={routes} locations={locations} />

      {/* Schedules Table Component */}
      <SchedulesTable schedules={schedules} routes={routes} />
    </div>
  );
}
