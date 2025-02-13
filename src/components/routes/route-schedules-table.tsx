import { RouteSchedule } from "@/types/route.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RouteSchedulesTableProps {
  routeSchedules: RouteSchedule[];
  onRouteScheduleSelect: (routeSchedule: RouteSchedule) => void;
  selectedRouteSchedule: RouteSchedule | null;
}

export function RouteSchedulesTable({
  routeSchedules,
  onRouteScheduleSelect,
  selectedRouteSchedule,
}: RouteSchedulesTableProps) {
  const formatOperatingDays = (days: string[]) => {
    const dayMap: Record<string, string> = {
      monday: "Lun",
      tuesday: "Mar",
      wednesday: "Mié",
      thursday: "Jue",
      friday: "Vie",
      saturday: "Sáb",
      sunday: "Dom",
    };
    return days.map(day => dayMap[day] || day).join(", ");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hora de Salida</TableHead>
          <TableHead>Días de Operación</TableHead>
          <TableHead>Temporada</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routeSchedules.map((schedule) => (
          <TableRow 
            key={schedule.id}
            className={selectedRouteSchedule?.id === schedule.id ? "bg-muted" : ""}
          >
            <TableCell>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {schedule.departureTime}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {formatOperatingDays(schedule.operatingDays)}
              </div>
            </TableCell>
            <TableCell>
              {schedule.seasonStart && schedule.seasonEnd ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(schedule.seasonStart), "dd MMM", { locale: es })} -{" "}
                    {format(new Date(schedule.seasonEnd), "dd MMM", { locale: es })}
                  </span>
                </div>
              ) : (
                <Badge variant="outline">Todo el año</Badge>
              )}
            </TableCell>
            <TableCell>
              <Badge variant={schedule.active ? "default" : "secondary"}>
                {schedule.active ? "Activo" : "Inactivo"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant={selectedRouteSchedule?.id === schedule.id ? "default" : "ghost"}
                onClick={() => onRouteScheduleSelect(schedule)}
              >
                {selectedRouteSchedule?.id === schedule.id ? "Seleccionado" : "Ver Viajes"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {routeSchedules.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No hay horarios configurados para esta ruta
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
