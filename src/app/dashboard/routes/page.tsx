"use client";

import { useState } from "react";
import {
  CreateRouteInput,
  CreateRouteScheduleInput,
  Route,
  RouteSchedule,
  Schedule,
  UpdateRouteInput
} from "@/types/route.types";
import { RoutesStatsCards } from "@/components/routes/routes-stats-cards";
import { RoutesTable } from "@/components/routes/routes-table";
import { RouteSchedulesTable } from "@/components/routes/route-schedules-table";
import { SchedulesTable } from "@/components/routes/schedules-table";
import { useBuses } from "@/hooks/useBuses";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AssignBusDialog } from "@/components/routes/assign-bus-dialog";
import { Plus, Clock } from "lucide-react";
import { CreateRouteDialog } from "@/components/routes/create-route-dialog";
import { CreateRouteScheduleDialog } from "@/components/routes/create-route-schedule-dialog";
import { useLocations } from "@/hooks/useLocations";
import { useRoutes, useRouteSchedules, useUpdateRouteSchedule, useCreateRouteSchedule } from "@/hooks/useRoutes";
import { LoadingTable } from "@/components/table/loading-table";
import { useSchedules } from "@/hooks/useSchedules";
import { useUserRoutes } from "@/hooks/useUserRoutes";

export default function RoutesPage() {
  const { toast } = useToast();
  const { userData } = useUserRoutes();
  const companyId = userData?.companyId || "";
  const { data: buses, isLoading: isLoadingBuses } = useBuses(companyId);
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  const {
    data: routes = [],
    isLoading: isLoadingRoutes,
    refetch
  } = useRoutes();

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const { 
    data: routeSchedules = [], 
    isLoading: isLoadingRouteSchedules,
    error: routeSchedulesError 
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
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] =
    useState(false);

  const updateRouteSchedule = useUpdateRouteSchedule();
  const { mutate: createRouteSchedule } = useCreateRouteSchedule();

  // Mostrar loading mientras se cargan los datos
  if (
    isLoadingRoutes ||
    isLoadingLocations ||
    isLoadingBuses ||
    isLoadingSchedules
  ) {
    return <LoadingTable columnCount={6} rowCount={10} />;
  }

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
      await createRouteSchedule({
        ...data,
        routeId: selectedRoute?.id || "",
      });

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

  const handleGenerateSchedules = async (
    routeSchedule: RouteSchedule, 
    startDate: string, 
    endDate: string,
    data: {
      busId?: string;
      primaryDriverId?: string;
      secondaryDriverId?: string;
    }
  ) => {
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeId: routeSchedule.routeId,
          routeScheduleId: routeSchedule.id,
          departureTime: routeSchedule.departureTime,
          operatingDays: routeSchedule.operatingDays,
          startDate,
          endDate,
          price: 0,
          status: "scheduled",
          busId: data.busId,
          primaryDriverId: data.primaryDriverId,
          secondaryDriverId: data.secondaryDriverId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al generar los horarios");
      }

      const createdSchedules = await response.json();

      toast({
        title: "Viajes generados",
        description: `Se han generado ${createdSchedules.length} viajes exitosamente con ${data.busId ? 'bus asignado' : 'sin bus'} y ${data.primaryDriverId ? 'conductor principal asignado' : 'sin conductor principal'}${data.secondaryDriverId ? ' y conductor secundario asignado' : ''}.`,
      });

      // Actualizar la lista de schedules
      await mutateSchedules();
    } catch (error) {
      console.error("Error generating schedules:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al generar los horarios",
        variant: "destructive",
      });
    }
  };

  // Filter schedules based on the selected route schedule
  const filteredSchedules = schedules.filter((schedule: Schedule) => 
    schedule.routeScheduleId === selectedRouteSchedule?.id
  );

  const handleEditSchedule = async (scheduleId: string, data: { departureDate: string; departureTime: string; }) => {
    try {
      const response = await fetch(`/api/schedules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: scheduleId,
          departure_date: new Date(`${data.departureDate}T${data.departureTime}`),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      await mutateSchedules();
      toast({
        title: "Horario actualizado",
        description: "El horario ha sido actualizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar horario",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/schedules?id=${scheduleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      await mutateSchedules();
      toast({
        title: "Horario eliminado",
        description: "El horario ha sido eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al eliminar horario",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleEditRoute = async (routeId: string, data: UpdateRouteInput) => {
    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update route");
      }

      await refetch();
      toast({
        title: "Ruta actualizada",
        description: "La ruta ha sido actualizada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al actualizar ruta",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details?.message || "Error al eliminar ruta");
      }

      await refetch();
      toast({
        title: "Ruta eliminada",
        description: "La ruta ha sido eliminada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al eliminar ruta",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSeasonDates = async (routeScheduleId: string, startDate: string, endDate: string) => {
    try {
      await updateRouteSchedule.mutateAsync({
        id: routeScheduleId,
        data: {
          seasonStart: startDate,
          seasonEnd: endDate,
        },
      });

      toast({
        title: "Temporada actualizada",
        description: "Las fechas de temporada han sido actualizadas exitosamente.",
      });
    } catch (error) {
      console.error("Error updating season dates:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar las fechas de temporada",
        variant: "destructive",
      });
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
          onAdd={() => setIsCreateDialogOpen(true)}
          onEdit={handleEditRoute}
          onDelete={handleDeleteRoute}
          companyId={companyId}
        />

        {selectedRoute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Horarios Recurrentes: {selectedRoute.name}</h2>
            </div>
            {isLoadingRouteSchedules ? (
              <LoadingTable columnCount={5} rowCount={5} />
            ) : routeSchedulesError ? (
              <div className="text-center p-4 text-red-500">
                Error al cargar los horarios: {routeSchedulesError.message}
              </div>
            ) : (
              <RouteSchedulesTable
                routeSchedules={routeSchedules}
                onRouteScheduleSelect={handleRouteScheduleSelect}
                selectedRouteSchedule={selectedRouteSchedule}
                onGenerateSchedules={handleGenerateSchedules}
                onUpdateSeasonDates={handleUpdateSeasonDates}
                companyId={companyId}
              />
            )}
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
              onEditSchedule={handleEditSchedule}
              onDeleteSchedule={handleDeleteSchedule}
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
