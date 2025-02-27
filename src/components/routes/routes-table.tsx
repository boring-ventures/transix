import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Location, Route, RouteWithRelations, UpdateRouteInput } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditRouteDialog } from "./edit-route-dialog";
import { DeleteRouteDialog } from "./delete-route-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface RoutesTableProps {
  routes: RouteWithRelations[];
  locations: Location[];
  onRouteSelect: (route: Route) => void;
  selectedRouteId?: string;
  onAdd?: () => void;
  onEdit?: (routeId: string, data: UpdateRouteInput) => Promise<void>;
  onDelete?: (routeId: string) => Promise<void>;
  onGenerateSchedules?: (routeId: string, startDate: Date, endDate: Date) => Promise<void>;
  onAssignBus?: (scheduleId: string) => Promise<void>;
  companyId: string;
}

export function RoutesTable({
  routes,
  locations,
  onRouteSelect,
  onEdit,
  onDelete,
}: RoutesTableProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const activeRoutes = routes.filter(route => route.active);
  const inactiveRoutes = routes.filter(route => !route.active);

  const handleEditRoute = async (routeId: string, data: UpdateRouteInput) => {
    try {
      await onEdit?.(routeId, data);
      toast({
        title: "Ruta actualizada",
        description: "La ruta ha sido actualizada exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar la ruta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    try {
      await onDelete?.(routeId);
      toast({
        title: "Ruta desactivada",
        description: "La ruta ha sido desactivada exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo desactivar la ruta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

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
      id: "departureLane",
      accessorKey: "departureLane",
      header: "Carril",
    },
    {
      id: "duration",
      accessorKey: "estimatedDuration",
      header: "Dur. Estimada (min)",
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoute(route);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRoute(route);
                  setDeleteDialogOpen(true);
                }}
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
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Rutas Activas</TabsTrigger>
          <TabsTrigger value="inactive">Rutas Inactivas</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeRoutes}
            onRowClick={onRouteSelect}
          />
        </TabsContent>
        <TabsContent value="inactive">
          <DataTable
            columns={columns}
            data={inactiveRoutes}
            onRowClick={onRouteSelect}
          />
        </TabsContent>
      </Tabs>

      {selectedRoute && (
        <>
          <EditRouteDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            route={selectedRoute}
            locations={locations}
            onSubmit={handleEditRoute}
          />

          <DeleteRouteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            route={selectedRoute}
            onConfirm={handleDeleteRoute}
          />
        </>
      )}
    </>
  );
}
