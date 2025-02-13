"use client";

import { useState } from "react";
import {
  CreateRouteInput,
  CreateRouteScheduleInput,
  Route,
  RouteSchedule,
  Schedule
} from "@/types/route.types";
import { RoutesStatsCards } from "@/components/routes/routes-stats-cards";
import { RoutesTable } from "@/components/routes/routes-table";
import { RouteSchedulesTable } from "@/components/routes/route-schedules-table";
import { SchedulesTable } from "@/components/routes/schedules-table";
import { useBuses } from "@/hooks/useBuses";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AssignBusDialog } from "@/components/routes/assign-bus-dialog";
import { Plus, Pencil, Trash2, Bus, Clock } from "lucide-react";
import { CreateRouteDialog } from "@/components/routes/create-route-dialog";
import { CreateRouteScheduleDialog } from "@/components/routes/create-route-schedule-dialog";
import { useLocations } from "@/hooks/useLocations";
import { useRoutes, useRouteSchedules } from "@/hooks/useRoutes";
import { LoadingTable } from "@/components/table/loading-table";
import { useSchedules } from "@/hooks/useSchedules";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Routes() {
  const { toast } = useToast();
  const { data: buses, isLoading: isLoadingBuses } = useBuses("1");
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    error: routesError,
    refetch
  } = useRoutes();

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const {
    data: routeSchedules = [],
    isLoading: isLoadingRouteSchedules
  } = useRouteSchedules(selectedRoute?.id);

  const {
    data: schedules = [],
    isLoading: isLoadingSchedules,
    refetch: mutateSchedules
  } = useSchedules();

  const [selectedRouteSchedule, setSelectedRouteSchedule] = useState<RouteSchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  const [isAssigning, setIsAssigning] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] = useState(false);

  const [newRoute, setNewRoute] = useState<CreateRouteInput>({
    name: "",
    originId: "",
    destinationId: "",
    estimatedDuration: 120,
    active: true,
  });

  const [newRouteSchedule, setNewRouteSchedule] = useState<CreateRouteScheduleInput>({
    routeId: "",
    departureTime: "08:00",
    operatingDays: ["monday", "wednesday", "friday"],
    active: true,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deletingRoute, setDeletingRoute] = useState<Route | null>(null);

  // Mostrar loading mientras se cargan los datos
  if (isLoadingRoutes || isLoadingLocations || isLoadingBuses || isLoadingSchedules) {
    return <LoadingTable columnCount={6} rowCount={10} />;
  }

  // Filtrar solo las rutas activas
  const activeRoutes = routes.filter(route => route.active);

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
    setSelectedRouteSchedule(null);
    setSelectedSchedule(null);
  };

  const handleRouteScheduleSelect = (routeSchedule: RouteSchedule) => {
    setSelectedRouteSchedule(routeSchedule);
    setSelectedSchedule(null);
  };

  const handleScheduleSelect = (schedule: Schedule) => {
    if (isLoadingBuses) {
      toast({
        title: "Cargando buses",
        description: "Por favor espere mientras se cargan los buses disponibles.",
      });
      return;
    }
    setSelectedSchedule(schedule);
  };

  const handleCreateRoute = async (data: CreateRouteInput) => {
    try {
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create route");
      }

      await refetch();
      setIsCreateDialogOpen(false);

      toast({
        title: "Ruta creada",
        description: "La ruta ha sido creada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al crear ruta",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleCreateRouteSchedule = async (data: CreateRouteScheduleInput) => {
    try {
      const response = await fetch("/api/route-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, routeId: selectedRoute?.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to create route schedule");
      }

      await refetch();
      setIsCreateScheduleDialogOpen(false);

      toast({
        title: "Horario creado",
        description: "El horario ha sido creado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al crear horario",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleAssignBus = async (data: { busId: string; scheduleId: string }) => {
    try {
      setIsAssigning(true);
      await fetch("/api/bus-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      await mutateSchedules();
      setIsAssignDialogOpen(false);
      toast({
        title: "Bus asignado",
        description: "El bus ha sido asignado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al asignar bus",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rutas</h1>
          <p className="text-muted-foreground">
            Gestiona las rutas y sus horarios
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Ruta
          </Button>
          {selectedRoute && (
            <Button onClick={() => setIsCreateScheduleDialogOpen(true)}>
              <Clock className="w-4 h-4 mr-2" />
              Nuevo Horario
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <RoutesStatsCards
          routes={routes}
          schedules={schedules}
        />

        <RoutesTable
          routes={routes}
          locations={locations}
          onRouteSelect={handleRouteSelect}
          selectedRouteId={selectedRoute?.id}
          onBusAssigned={handleAssignBus}
          onAdd={() => setIsCreateDialogOpen(true)}
          onEdit={(route) => {
            setEditingRoute(route);
            setIsEditOpen(true);
          }}
          onDelete={(route) => {
            setDeletingRoute(route);
            setIsDeleteOpen(true);
          }}
        />

        {selectedRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Horarios de {selectedRoute.name}</h2>
            </div>
            <RouteSchedulesTable
              routeSchedules={routeSchedules as unknown as RouteSchedule[]}
              onRouteScheduleSelect={handleRouteScheduleSelect}
              selectedRouteSchedule={selectedRouteSchedule}
            />
          </div>
        )}

        {selectedRouteSchedule && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Viajes Programados</h2>
            </div>
            <SchedulesTable
              schedules={schedules.filter((schedule: Schedule) =>
                schedule.routeScheduleId === selectedRouteSchedule.id
              )}
              routes={routes}
              onScheduleSelect={handleScheduleSelect}
            />
          </div>
        )}
      </div>

      <CreateRouteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        locations={locations}
        onSubmit={handleCreateRoute}
      />

      {selectedRoute && (
        <CreateRouteScheduleDialog
          open={isCreateScheduleDialogOpen}
          onOpenChange={setIsCreateScheduleDialogOpen}
          onSubmit={handleCreateRouteSchedule}
          route={selectedRoute}
        />
      )}

      {selectedSchedule && (
        <AssignBusDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          schedule={selectedSchedule}
          buses={buses ?? []}
          onAssign={handleAssignBus}
          isSubmitting={isAssigning}
        />
      )}
    </div>
  );
}
