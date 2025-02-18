import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Route, Schedule } from "@/types/route.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Bus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditScheduleDialog } from "./edit-schedule-dialog";
import { DeleteScheduleDialog } from "./delete-schedule-dialog";
import { useToast } from "@/hooks/use-toast";

// Shows a table with the available schedules

interface SchedulesTableProps {
  schedules: Schedule[];
  routes: Route[];
  onScheduleSelect: (schedule: Schedule) => void;
  onAssignBus?: (schedule: Schedule) => void;
  onEditSchedule?: (scheduleId: string, data: { departureDate: string; departureTime: string; price: number }) => Promise<void>;
  onDeleteSchedule?: (scheduleId: string) => Promise<void>;
}

export function SchedulesTable({ 
  schedules, 
  routes, 
  onScheduleSelect,
  onAssignBus,
  onEditSchedule,
  onDeleteSchedule
}: SchedulesTableProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEditSchedule = async (scheduleId: string, data: { departureDate: string; departureTime: string; price: number }) => {
    try {
      await onEditSchedule?.(scheduleId, data);
      toast({
        title: "Horario actualizado",
        description: "El horario ha sido actualizado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el horario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await onDeleteSchedule?.(scheduleId);
      toast({
        title: "Horario eliminado",
        description: "El horario ha sido eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el horario. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const scheduleColumns: Column<Schedule>[] = [
    {
      id: "route",
      accessorKey: "routeId",
      header: "Ruta",
      cell: ({ row }) => {
        const route = routes.find((r) => r.id === row.routeId);
        return route ? route.name : "";
      },
      sortable: true,
    },
    {
      id: "departureDate",
      accessorKey: "departureDate",
      header: "Fecha y Hora de Salida",
      cell: ({ row }) => {
        const date = new Date(row.departureDate);
        return format(date, "dd/MM/yyyy HH:mm", { locale: es });
      },
      sortable: true,
    },
    {
      id: "estimatedArrivalTime",
      accessorKey: "estimatedArrivalTime",
      header: "Llegada Estimada",
      cell: ({ row }) => {
        if (!row.estimatedArrivalTime) return "No disponible";
        return format(new Date(row.estimatedArrivalTime), "dd/MM/yyyy HH:mm", { locale: es });
      },
      sortable: true,
    },
    {
      id: "bus",
      accessorKey: "busId",
      header: "Bus Asignado",
      cell: ({ row }) => {
        // Check bus assignments for this schedule
        const busAssignment = row.busAssignments?.find(assignment => 
          assignment.status === 'active'
        );

        if (!busAssignment) {
          return (
            <span className="text-yellow-600 font-medium">
              No asignado
            </span>
          );
        }

        const bus = busAssignment.bus;
        return (
          <span className="text-green-600 font-medium">
            {bus ? `${bus.plateNumber} (${bus.template?.name || 'N/A'})` : busAssignment.busId}
          </span>
        );
      },
      sortable: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.status;
        const statusClasses = {
          scheduled: "bg-green-100 text-green-800",
          in_progress: "bg-blue-100 text-blue-800",
          completed: "bg-gray-100 text-gray-800",
          cancelled: "bg-red-100 text-red-800",
          delayed: "bg-yellow-100 text-yellow-800"
        };
        
        const statusLabels = {
          scheduled: "Programado",
          in_progress: "En Progreso",
          completed: "Completado",
          cancelled: "Cancelado",
          delayed: "Retrasado"
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
            {statusLabels[status]}
          </span>
        );
      },
      sortable: true,
    },
    {
      id: "actions",
      accessorKey: "id",
      header: "Acciones",
      cell: ({ row }) => {
        const hasActiveAssignment = row.busAssignments?.some(
          assignment => assignment.status === 'active'
        );

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onAssignBus?.(row);
              }}
              disabled={row.status !== 'scheduled' || hasActiveAssignment}
              title={
                row.status !== 'scheduled' 
                  ? 'Solo se pueden asignar buses a viajes programados'
                  : hasActiveAssignment
                  ? 'Este viaje ya tiene un bus asignado'
                  : 'Asignar bus'
              }
            >
              <Bus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSchedule(row);
                setEditDialogOpen(true);
              }}
              disabled={row.status !== 'scheduled'}
              title={
                row.status !== 'scheduled'
                  ? 'Solo se pueden editar viajes programados'
                  : 'Editar viaje'
              }
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSchedule(row);
                setDeleteDialogOpen(true);
              }}
              disabled={row.status !== 'scheduled' || hasActiveAssignment}
              title={
                row.status !== 'scheduled'
                  ? 'Solo se pueden eliminar viajes programados'
                  : hasActiveAssignment
                  ? 'No se puede eliminar un viaje con bus asignado'
                  : 'Eliminar viaje'
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      {schedules.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No hay viajes programados para este horario
        </div>
      ) : (
        <DataTable
          title="Horarios"
          data={schedules}
          columns={scheduleColumns}
          searchable={true}
          searchField="routeId"
          onRowClick={(schedule) => onScheduleSelect(schedule)}
        />
      )}

      {selectedSchedule && (
        <>
          <EditScheduleDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            schedule={selectedSchedule}
            onSubmit={handleEditSchedule}
          />

          <DeleteScheduleDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            schedule={selectedSchedule}
            onConfirm={handleDeleteSchedule}
          />
        </>
      )}
    </>
  );
}
