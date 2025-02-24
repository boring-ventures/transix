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
import { Clock, Calendar, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface RouteSchedulesTableProps {
  routeSchedules: RouteSchedule[];
  onRouteScheduleSelect: (routeSchedule: RouteSchedule) => void;
  selectedRouteSchedule: RouteSchedule | null;
  onGenerateSchedules?: (routeSchedule: RouteSchedule, startDate: string, endDate: string) => void;
}

export function RouteSchedulesTable({
  routeSchedules,
  onRouteScheduleSelect,
  selectedRouteSchedule,
  onGenerateSchedules
}: RouteSchedulesTableProps) {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedScheduleForGeneration, setSelectedScheduleForGeneration] = useState<RouteSchedule | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const handleGenerateClick = (schedule: RouteSchedule) => {
    setSelectedScheduleForGeneration(schedule);
    // Establecer fechas por defecto (una semana)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    setStartDate(format(today, "yyyy-MM-dd"));
    setEndDate(format(nextWeek, "yyyy-MM-dd"));
    setIsGenerateDialogOpen(true);
  };

  const handleGenerateConfirm = () => {
    if (selectedScheduleForGeneration && startDate && endDate) {
      onGenerateSchedules?.(selectedScheduleForGeneration, startDate, endDate);
      setIsGenerateDialogOpen(false);
      setSelectedScheduleForGeneration(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora de Salida</TableHead>
              <TableHead>Hora de Llegada</TableHead>
              <TableHead>Días de Operación</TableHead>
              <TableHead>Temporada</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routeSchedules.map((schedule) => {
              const isSelected = selectedRouteSchedule?.id === schedule.id;
              return (
                <TableRow
                  key={schedule.id}
                  className={`cursor-pointer ${
                    isSelected ? "bg-primary/5" : ""
                  } hover:bg-primary/5`}
                  onClick={() => onRouteScheduleSelect(schedule)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {schedule.departureTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {schedule.estimatedArrivalTime}
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateClick(schedule);
                        }}
                        title="Generar viajes para este horario"
                      >
                        <CalendarPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {routeSchedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay horarios configurados para esta ruta
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Viajes</DialogTitle>
            <DialogDescription>
              Selecciona el rango de fechas para generar los viajes de este horario.
              Se generarán viajes solo para los días: {selectedScheduleForGeneration?.operatingDays.join(", ")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateConfirm}
              disabled={!startDate || !endDate}
            >
              Generar Viajes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
