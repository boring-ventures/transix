import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Route, Schedule } from "@/types/route.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Bus } from "@/components/icons/bus";

// Shows a table with the available schedules

interface SchedulesTableProps {
  schedules: Schedule[];
  routes: Route[];
  onScheduleSelect: (schedule: Schedule) => void;
  onAssignBus?: (schedule: Schedule) => void;
}

export function SchedulesTable({ 
  schedules, 
  routes, 
  onScheduleSelect,
  onAssignBus 
}: SchedulesTableProps) {
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
      header: "Fecha Salida",
      cell: ({ row }) => format(new Date(row.departureDate), "dd/MM/yyyy", { locale: es }),
      sortable: true,
    },
    {
      id: "estimatedArrivalTime",
      accessorKey: "estimatedArrivalTime",
      header: "Llegada Estimada",
      cell: ({ row }) => format(new Date(row.estimatedArrivalTime), "dd/MM/yyyy HH:mm", { locale: es }),
      sortable: true,
    },
    {
      id: "actualDepartureTime",
      accessorKey: "actualDepartureTime",
      header: "Salida Real",
      cell: ({ row }) => row.actualDepartureTime 
        ? format(new Date(row.actualDepartureTime), "dd/MM/yyyy HH:mm", { locale: es })
        : "No registrada",
      sortable: true,
    },
    {
      id: "actualArrivalTime",
      accessorKey: "actualArrivalTime",
      header: "Llegada Real",
      cell: ({ row }) => row.actualArrivalTime 
        ? format(new Date(row.actualArrivalTime), "dd/MM/yyyy HH:mm", { locale: es })
        : "No registrada",
      sortable: true,
    },
    {
      id: "bus",
      accessorKey: "busId",
      header: "Bus Asignado",
      cell: ({ row }) => row.busId || "No asignado",
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
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onAssignBus?.(row);
            }}
          >
            <Bus className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Horarios"
      data={schedules}
      columns={scheduleColumns}
      searchable={true}
      searchField="routeId"
      onRowClick={(schedule) => onScheduleSelect(schedule)}
    />
  );
}
