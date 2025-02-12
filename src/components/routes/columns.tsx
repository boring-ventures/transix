import { ColumnDef } from "@tanstack/react-table";
import { Route } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Route>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "origin.name",
    header: "Origen",
  },
  {
    accessorKey: "destination.name",
    header: "Destino",
  },
  {
    accessorKey: "departureTime",
    header: "Hora de Salida",
  },
  {
    accessorKey: "arrivalTime",
    header: "Hora de Llegada",
  },
  {
    accessorKey: "capacity",
    header: "Capacidad",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const route = row.original;

      return (
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
]; 