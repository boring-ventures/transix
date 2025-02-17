import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Location, Route, RouteWithRelations } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import { Bus } from "@/components/icons/bus";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { AssignBusDialog } from "./assign-bus-dialog";
import { useBuses } from "@/hooks/useBuses";
import { useBusAssignments, BusAssignment } from "@/hooks/useBusAssignments";

interface RoutesTableProps {
  routes: RouteWithRelations[];
  locations: Location[];
  onRouteSelect: (route: Route) => void;
  selectedRouteId?: string;
  onBusAssigned: (data: { busId: string; scheduleId: string }) => Promise<void>;
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
  onBusAssigned,
  onAdd,
  onEdit,
  onDelete,
  companyId,
}: RoutesTableProps) {
  const [isAssignBusDialogOpen, setIsAssignBusDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithRelations | null>(null);
  const { data: buses = [] } = useBuses(companyId);
  const { data: busAssignments = [] } = useBusAssignments();

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
        const busAssignment = busAssignments.find(
          (assignment) => assignment.routeId === route.id && assignment.status === 'active'
        );

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedRoute(route);
                setIsAssignBusDialogOpen(true);
              }}
            >
              <Bus className="h-4 w-4" />
              {busAssignment && (
                <span className="ml-2">{busAssignment.bus?.plateNumber}</span>
              )}
            </Button>
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
    <>
      <DataTable
        columns={columns}
        data={routes}
        onRowClick={onRouteSelect}
      />
      {selectedRoute && (
        <AssignBusDialog
          open={isAssignBusDialogOpen}
          onOpenChange={setIsAssignBusDialogOpen}
          route={selectedRoute}
          buses={buses}
          onAssign={onBusAssigned}
        />
      )}
    </>
  );
}
