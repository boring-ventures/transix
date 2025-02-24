import type { RouteSchedule } from "@/types/route.types";
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
import { Clock, Calendar, CalendarPlus, Edit } from "lucide-react";
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
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBuses } from "@/hooks/useBuses";
import { useDrivers } from "@/hooks/useDrivers";
import { useToast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/useCompanies";

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
  onUpdateSeasonDates?: (routeScheduleId: string, startDate: string, endDate: string) => Promise<void>;
  companyId?: string;
}

export function RouteSchedulesTable({
  routeSchedules,
  onRouteScheduleSelect,
  selectedRouteSchedule,
  onGenerateSchedules,
  onUpdateSeasonDates,
}: RouteSchedulesTableProps) {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isEditSeasonDialogOpen, setIsEditSeasonDialogOpen] = useState(false);
  const [selectedScheduleForGeneration, setSelectedScheduleForGeneration] = useState<RouteSchedule | null>(null);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState<RouteSchedule | null>(null);
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [selectedPrimaryDriverId, setSelectedPrimaryDriverId] = useState<string>("");
  const [selectedSecondaryDriverId, setSelectedSecondaryDriverId] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const { data: companies } = useCompanies();
  const { data: buses } = useBuses(selectedCompanyId);
  const { data: drivers } = useDrivers(selectedCompanyId);
  const { toast } = useToast();

  // Filtrar buses activos y disponibles
  const availableBuses = useMemo(() => {
    return buses?.filter(bus => bus.isActive && bus.maintenanceStatus === 'active') || [];
  }, [buses]);

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
    
    // Usar fechas de temporada si están disponibles
    if (schedule.seasonStart && schedule.seasonEnd) {
      setEditStartDate(format(new Date(schedule.seasonStart), "yyyy-MM-dd"));
      setEditEndDate(format(new Date(schedule.seasonEnd), "yyyy-MM-dd"));
    }
    
    setIsGenerateDialogOpen(true);
  };

  const handleGenerateConfirm = () => {
    if (selectedScheduleForGeneration?.seasonStart && selectedScheduleForGeneration?.seasonEnd) {
      onGenerateSchedules?.(
        selectedScheduleForGeneration, 
        format(new Date(selectedScheduleForGeneration.seasonStart), "yyyy-MM-dd"),
        format(new Date(selectedScheduleForGeneration.seasonEnd), "yyyy-MM-dd"),
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
      setSelectedCompanyId("");
    }
  };

  const handleEditSeasonClick = (schedule: RouteSchedule) => {
    setSelectedScheduleForEdit(schedule);
    if (schedule.seasonStart && schedule.seasonEnd) {
      setEditStartDate(format(new Date(schedule.seasonStart), "yyyy-MM-dd"));
      setEditEndDate(format(new Date(schedule.seasonEnd), "yyyy-MM-dd"));
    }
    setIsEditSeasonDialogOpen(true);
  };

  const handleEditSeasonConfirm = async () => {
    if (selectedScheduleForEdit && editStartDate && editEndDate) {
      try {
        await onUpdateSeasonDates?.(selectedScheduleForEdit.id, editStartDate, editEndDate);
        toast({
          title: "Temporada actualizada",
          description: "El rango de fechas ha sido actualizado exitosamente.",
        });
        setIsEditSeasonDialogOpen(false);
      } catch {
        toast({
          title: "Error",
          description: "No se pudo actualizar el rango de fechas. Por favor, intente de nuevo.",
          variant: "destructive",
        });
      }
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSeasonClick(schedule);
                        }}
                        title="Editar rango de temporada"
                      >
                        <Edit className="h-4 w-4" />
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
              {selectedScheduleForGeneration?.seasonStart && selectedScheduleForGeneration?.seasonEnd 
                ? "Configure los detalles para generar los viajes en el periodo seleccionado"
                : "Este horario no tiene un periodo definido. Por favor, defina un periodo en la configuración del horario."
              }
            </DialogDescription>
          </DialogHeader>

          {selectedScheduleForGeneration?.seasonStart && selectedScheduleForGeneration?.seasonEnd && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Periodo de generación:</h4>
                <div className="p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {format(new Date(selectedScheduleForGeneration.seasonStart), "dd MMM yyyy", { locale: es })} -{" "}
                      {format(new Date(selectedScheduleForGeneration.seasonEnd), "dd MMM yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Días de operación: </span>
                  <span>{formatOperatingDays(selectedScheduleForGeneration.operatingDays)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Empresa</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Bus</Label>
              <Select 
                value={selectedBusId} 
                onValueChange={setSelectedBusId}
                disabled={!selectedCompanyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCompanyId ? "Seleccionar bus" : "Seleccione una empresa primero"} />
                </SelectTrigger>
                <SelectContent>
                  {availableBuses.map((bus) => (
                    <SelectItem key={bus.id} value={bus.id}>
                      {bus.plateNumber} - {bus.template?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Conductor Principal</Label>
              <Select 
                value={selectedPrimaryDriverId} 
                onValueChange={setSelectedPrimaryDriverId}
                disabled={!selectedCompanyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCompanyId ? "Seleccionar conductor principal" : "Seleccione una empresa primero"} />
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
              <Label>Conductor Secundario (Opcional)</Label>
              <Select 
                value={selectedSecondaryDriverId} 
                onValueChange={setSelectedSecondaryDriverId}
                disabled={!selectedCompanyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCompanyId ? "Seleccionar conductor secundario" : "Seleccione una empresa primero"} />
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
                setSelectedCompanyId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateConfirm}
              disabled={
                !selectedScheduleForGeneration?.seasonStart || 
                !selectedScheduleForGeneration?.seasonEnd ||
                !selectedCompanyId ||
                !selectedBusId
              }
            >
              Generar Viajes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditSeasonDialogOpen} onOpenChange={setIsEditSeasonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rango de Temporada</DialogTitle>
            <DialogDescription>
              Modifique el rango de fechas para la temporada de este horario.
              Los viajes se generarán dentro de este rango para los días: {selectedScheduleForEdit?.operatingDays && formatOperatingDays(selectedScheduleForEdit.operatingDays)}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editStartDate">Fecha de Inicio</Label>
              <Input
                id="editStartDate"
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEndDate">Fecha de Fin</Label>
              <Input
                id="editEndDate"
                type="date"
                value={editEndDate}
                onChange={(e) => setEditEndDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditSeasonDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditSeasonConfirm}
              disabled={!editStartDate || !editEndDate}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
