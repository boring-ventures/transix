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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBuses } from "@/hooks/useBuses";
import { useDrivers } from "@/hooks/useDrivers";

interface RouteSchedulesTableProps {
  routeSchedules: RouteSchedule[];
  onRouteScheduleSelect: (routeSchedule: RouteSchedule) => void;
  selectedRouteSchedule: RouteSchedule | null;
  onGenerateSchedules?: (
    routeSchedule: RouteSchedule, 
    startDate: string, 
    endDate: string,
    data: {
      busId?: string;
      primaryDriverId?: string;
      secondaryDriverId?: string;
    }
  ) => void;
  companyId: string;
}

export function RouteSchedulesTable({
  routeSchedules,
  onRouteScheduleSelect,
  selectedRouteSchedule,
  onGenerateSchedules,
  companyId
}: RouteSchedulesTableProps) {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedScheduleForGeneration, setSelectedScheduleForGeneration] = useState<RouteSchedule | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [selectedPrimaryDriverId, setSelectedPrimaryDriverId] = useState<string>("");
  const [selectedSecondaryDriverId, setSelectedSecondaryDriverId] = useState<string>("");

  const { data: buses } = useBuses(companyId);
  const { data: drivers } = useDrivers(companyId);

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
    
    // Usar fechas de temporada si están disponibles, sino usar una semana por defecto
    if (schedule.seasonStart && schedule.seasonEnd) {
      setStartDate(format(new Date(schedule.seasonStart), "yyyy-MM-dd"));
      setEndDate(format(new Date(schedule.seasonEnd), "yyyy-MM-dd"));
    } else {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      setStartDate(format(today, "yyyy-MM-dd"));
      setEndDate(format(nextWeek, "yyyy-MM-dd"));
    }
    
    setIsGenerateDialogOpen(true);
  };

  const handleGenerateConfirm = () => {
    if (selectedScheduleForGeneration && startDate && endDate) {
      onGenerateSchedules?.(
        selectedScheduleForGeneration, 
        startDate, 
        endDate,
        {
          busId: selectedBusId || undefined,
          primaryDriverId: selectedPrimaryDriverId || undefined,
          secondaryDriverId: selectedSecondaryDriverId || undefined,
        }
      );
      setIsGenerateDialogOpen(false);
      setSelectedScheduleForGeneration(null);
      setSelectedBusId("");
      setSelectedPrimaryDriverId("");
      setSelectedSecondaryDriverId("");
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
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
              {selectedScheduleForGeneration?.seasonStart && selectedScheduleForGeneration?.seasonEnd ? (
                <>
                  Se usarán las fechas de temporada configuradas para generar los viajes.
                  Los viajes se generarán para los días: {selectedScheduleForGeneration?.operatingDays.join(", ")}
                </>
              ) : (
                <>
                  Se usará un rango de una semana por defecto.
                  Los viajes se generarán para los días: {selectedScheduleForGeneration?.operatingDays.join(", ")}
                </>
              )}
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

            <div className="grid gap-2">
              <Label>Bus</Label>
              <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar bus" />
                </SelectTrigger>
                <SelectContent>
                  {buses?.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.plateNumber} - {bus.template?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Conductor Principal</Label>
              <Select value={selectedPrimaryDriverId} onValueChange={setSelectedPrimaryDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conductor principal" />
                </SelectTrigger>
                <SelectContent>
                  {drivers?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.fullName} - {driver.licenseNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Conductor Secundario</Label>
              <Select value={selectedSecondaryDriverId} onValueChange={setSelectedSecondaryDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar conductor secundario" />
                </SelectTrigger>
                <SelectContent>
                  {drivers?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.fullName} - {driver.licenseNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsGenerateDialogOpen(false);
                setSelectedBusId("");
                setSelectedPrimaryDriverId("");
                setSelectedSecondaryDriverId("");
              }}
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
