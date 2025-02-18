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
  const companyId = "1"; // TODO: Get this from user context or environment
  const { data: buses, isLoading: isLoadingBuses } = useBuses(companyId);
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

  const handleAssignBus = async (data: { 
    busId: string; 
    scheduleId: string;
    routeId: string;
    startTime: string;
    endTime: string;
  }) => {
    if (!data.scheduleId) {
      toast({
        title: "Error al asignar bus",
        description: "Debe seleccionar un horario para asignar un bus",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAssigning(true);
      const response = await fetch("/api/bus-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json().catch(() => ({ 
        error: "Error al procesar la respuesta del servidor" 
      }));

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || "Error al asignar bus");
      }
      
      await mutateSchedules();
      setIsAssignDialogOpen(false);
      toast({
        title: "Bus asignado",
        description: "El bus ha sido asignado exitosamente.",
      });
    } catch (error) {
      console.error("Error al asignar bus:", error);
      toast({
        title: "Error al asignar bus",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleGenerateSchedules = async (routeSchedule: RouteSchedule) => {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      // Get the operating days for this schedule
      const daysToGenerate = routeSchedule.operatingDays;
      
      // Show loading toast
      toast({
        title: "Generando viajes",
        description: `Generando viajes para los próximos ${daysToGenerate.length} días operativos.`,
      });

      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: routeSchedule.routeId,
          routeScheduleId: routeSchedule.id,
          departureTime: routeSchedule.departureTime,
          operatingDays: daysToGenerate,
          startDate: today.toISOString().split('T')[0],
          endDate: nextWeek.toISOString().split('T')[0],
          price: 0,
          status: 'scheduled' // Explicitly set the initial status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al generar viajes");
      }

      const result = await response.json();
      
      // Refresh the schedules data
      await mutateSchedules();

      toast({
        title: "Viajes generados",
        description: `Se han generado ${result.count || 'los'} viajes exitosamente.`,
      });
    } catch (error) {
      console.error("Error al generar viajes:", error);
      toast({
        title: "Error al generar viajes",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  // Filter schedules based on the selected route schedule
  const filteredSchedules = schedules.filter((schedule: Schedule) => 
    schedule.routeScheduleId === selectedRouteSchedule?.id
  );

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
          onAdd={() => setIsCreateDialogOpen(true)}
          onEdit={(route) => {
            setEditingRoute(route);
            setIsEditOpen(true);
          }}
          onDelete={(route) => {
            setDeletingRoute(route);
            setIsDeleteOpen(true);
          }}
          companyId={companyId}
        />

        {selectedRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Horarios Recurrentes: {selectedRoute.name}</h2>
            </div>
            <RouteSchedulesTable
              routeSchedules={routeSchedules as unknown as RouteSchedule[]}
              onRouteScheduleSelect={handleRouteScheduleSelect}
              selectedRouteSchedule={selectedRouteSchedule}
              onGenerateSchedules={handleGenerateSchedules}
            />
          </div>
        )}

        {selectedRouteSchedule && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Viajes Programados</h2>
              <div className="text-sm text-muted-foreground">
                {filteredSchedules.length} viajes encontrados
              </div>
            </div>
            <SchedulesTable
              schedules={filteredSchedules}
              routes={routes}
              onScheduleSelect={handleScheduleSelect}
              onAssignBus={(schedule: Schedule) => {
                setSelectedSchedule(schedule);
                setIsAssignDialogOpen(true);
              }}
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
