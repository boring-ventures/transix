import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Route, Schedule } from "@/types/route.types";

// Shows a table with the available schedules

interface SchedulesTableProps {
  schedules: Schedule[];
  routes: Route[];
}

export function SchedulesTable({ schedules, routes }: SchedulesTableProps) {
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
    <DataTable
      title="Horarios"
      data={schedules}
      columns={scheduleColumns}
      searchable={true}
      searchField="routeId"
    />
  );
}
