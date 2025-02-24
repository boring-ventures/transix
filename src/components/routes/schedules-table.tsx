import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Schedule } from "@/types/route.types";
import { Route } from "@/types/route.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditScheduleDialog } from "./edit-schedule-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleEditSchedule = async (scheduleId: string, data: { departureDate: string; departureTime: string; price: number }) => {
    if (onEditSchedule) {
      await onEditSchedule(scheduleId, data);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (onDeleteSchedule) {
      await onDeleteSchedule(scheduleId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Día</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>
                  {format(new Date(schedule.departureDate), "EEEE", { locale: es })}
                </TableCell>
                <TableCell>
                  {format(new Date(schedule.departureDate), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {format(new Date(schedule.departureDate), "HH:mm")}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {getStatusText(schedule.status)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setDetailsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setEditDialogOpen(true);
                      }}
                      disabled={schedule.status !== 'scheduled'}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      disabled={schedule.status !== 'scheduled'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedSchedule && (
        <>
          <EditScheduleDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            schedule={selectedSchedule}
            onSubmit={handleEditSchedule}
          />

          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalles del Viaje</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Bus Asignado</h4>
                    {selectedSchedule.bus ? (
                      <div className="text-sm">
                        <p>Placa: {selectedSchedule.bus.plateNumber}</p>
                        <p>Tipo: {selectedSchedule.bus.template?.type}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin bus asignado</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Conductores</h4>
                    <div className="text-sm">
                      <p>Principal: {selectedSchedule.primaryDriver?.fullName || 'No asignado'}</p>
                      <p>Secundario: {selectedSchedule.secondaryDriver?.fullName || 'No asignado'}</p>
                    </div>
                  </div>
                </div>
                {selectedSchedule.bus && (
                  <div>
                    <h4 className="font-medium mb-2">Detalles del Bus</h4>
                    <div className="text-sm">
                      <p>Asientos: {selectedSchedule.bus.seats?.length || 0}</p>
                      <p>Modelo: {selectedSchedule.bus.template?.name || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
