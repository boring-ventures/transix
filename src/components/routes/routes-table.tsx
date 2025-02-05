import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Location, Route } from "@/types/route.types";

// Shows a table with the available routes

interface RoutesTableProps {
  routes: Route[];
  locations: Location[];
}

export function RoutesTable({ routes, locations }: RoutesTableProps) {
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
      cell: ({ row }) => getLocationName(row.originId || ""),
      sortable: true,
    },
    {
      id: "destination",
      accessorKey: "destinationId",
      header: "Destino",
      cell: ({ row }) => getLocationName(row.destinationId || ""),
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

  return (
    <DataTable
      title="Rutas Disponibles"
      data={routes}
      columns={routeColumns}
      searchable={true}
      searchField="name"
    />
  );
}
