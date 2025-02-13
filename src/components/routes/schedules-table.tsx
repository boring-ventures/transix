import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Route, Schedule } from "@/types/route.types";

// Shows a table with the available schedules

interface SchedulesTableProps {
  schedules: Schedule[];
  routes: Route[];
  onScheduleSelect: (schedule: Schedule) => void;
}

export function SchedulesTable({ schedules, routes, onScheduleSelect }: SchedulesTableProps) {
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
      sortable: true,
    },
    {
      id: "departureTime",
      accessorKey: "departureTime",
      header: "Hora Salida",
      sortable: true,
    },
    {
      id: "arrivalTime",
      accessorKey: "arrivalTime",
      header: "Hora Llegada",
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
      id: "availableSeats",
      accessorKey: "availableSeats",
      header: "Asientos Disponibles",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span>{row.availableSeats}</span>
            <span className="text-muted-foreground text-sm">
              / {row.capacity}
            </span>
          </div>
        );
      },
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
          completed: "bg-gray-100 text-gray-800",
          cancelled: "bg-red-100 text-red-800",
          in_progress: "bg-blue-100 text-blue-800"
        };
        
        const statusLabels = {
          scheduled: "Programado",
          completed: "Completado",
          cancelled: "Cancelado",
          in_progress: "En Progreso"
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
            {statusLabels[status]}
          </span>
        );
      },
      sortable: true,
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
