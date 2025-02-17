import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Location, Route, RouteWithRelations, Schedule } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface RoutesTableProps {
  routes: RouteWithRelations[];
  locations: Location[];
  onRouteSelect: (route: Route) => void;
  selectedRouteId?: string;
  onAdd?: () => void;
  onEdit?: (route: Route) => void;
  onDelete?: (route: Route) => void;
  companyId: string;
}

export function RoutesTable({
  routes,
  locations,
  onRouteSelect,
  selectedRouteId,
  onAdd,
  onEdit,
  onDelete,
  companyId,
}: RoutesTableProps) {
  const columns: Column<RouteWithRelations>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
    },
    {
      id: "origin",
      accessorKey: "origin",
      header: "Origen",
      cell: ({ row }) => row.origin?.name,
    },
    {
      id: "destination",
      accessorKey: "destination",
      header: "Destino",
      cell: ({ row }) => row.destination?.name,
    },
    {
      id: "duration",
      accessorKey: "estimatedDuration",
      header: "Duración (min)",
    },
    {
      id: "actions",
      accessorKey: "id",
      header: "Acciones",
      cell: ({ row }) => {
        const route = row;
        return (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(route)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(route)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={routes}
      onRowClick={onRouteSelect}
    />
  );
}
