import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Location, Route, RouteWithRelations, Schedule } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import { Bus } from "@/components/icons/bus";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { AssignBusDialog } from "./assign-bus-dialog";
import { useBuses } from "@/hooks/useBuses";

interface RoutesTableProps {
  routes: RouteWithRelations[];
  locations: Location[];
  onRouteSelect: (route: Route) => void;
  selectedRouteId?: string;
  onBusAssigned: (data: { busId: string; scheduleId: string }) => Promise<void>;
  onAdd?: () => void;
  onEdit?: (route: Route) => void;
  onDelete?: (route: Route) => void;
}

export function RoutesTable({ 
  routes, 
  locations, 
  onBusAssigned,
  onRouteSelect,
  selectedRouteId,
  onAdd,
  onEdit,
  onDelete
}: RoutesTableProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { data: buses } = useBuses("1");

  const getLocationName = (id: string) => {
    return locations.find((loc) => loc.id === id)?.name || "";
  };

  const handleAssignBus = async (data: { busId: string; scheduleId: string }) => {
    await onBusAssigned(data);
    setIsAssignDialogOpen(false);
  };

  const routeColumns: Column<Route>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      sortable: true,
      cell: ({ row }) => (
        <Button
          variant="link"
          className={`p-0 h-auto font-normal ${row.id === selectedRouteId ? 'text-primary font-medium' : ''}`}
          onClick={() => onRouteSelect(row)}
        >
          {row.name}
        </Button>
      ),
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
      id: "schedule",
      accessorKey: "estimatedDuration",
      header: "Horario",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>Duración estimada: {row.estimatedDuration} min</span>
        </div>
      ),
      sortable: false,
    },
    {
      id: "actions",
      accessorKey: "id",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const schedule: Schedule = {
                id: crypto.randomUUID(),
                routeId: row.id,
                routeScheduleId: "",
                busId: "",
                departureDate: new Date().toISOString(),
                estimatedArrivalTime: new Date(),
                actualDepartureTime: null,
                actualArrivalTime: null,
                price: 0,
                status: "scheduled",
                createdAt: new Date(),
                updatedAt: new Date()
              };
              setSelectedSchedule(schedule);
              setIsAssignDialogOpen(true);
            }}
          >
            <Bus className="mr-2 h-4 w-4" />
            Asignar Bus
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
            >
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
            >
              Eliminar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Rutas Disponibles"
        data={routes}
        columns={routeColumns}
        searchable={true}
        searchField="name"
        onAdd={onAdd}
      />
      
      {selectedSchedule && (
        <AssignBusDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          schedule={selectedSchedule}
          buses={buses || []}
          onAssign={handleAssignBus}
          isSubmitting={false}
        />
      )}
    </>
  );
}
