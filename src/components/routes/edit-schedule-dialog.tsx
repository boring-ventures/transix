import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Schedule } from "@/types/route.types";
import { format } from "date-fns";
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
import { useUserRoutes } from "@/hooks/useUserRoutes";

interface EditScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: Schedule;
    onSubmit: (scheduleId: string, data: { 
        departureDate: string; 
        departureTime: string; 
    }) => Promise<void>;
}

export function EditScheduleDialog({
    open,
    onOpenChange,
    schedule,
    onSubmit,
}: EditScheduleDialogProps) {
    const { userData } = useUserRoutes();
    const companyId = userData?.companyId || "";
    const { data: buses } = useBuses(companyId);
    const { data: drivers } = useDrivers(companyId);

    const [departureDate, setDepartureDate] = useState(
        format(new Date(schedule.departureDate), "yyyy-MM-dd")
    );
    const [departureTime, setDepartureTime] = useState(
        format(new Date(schedule.departureDate), "HH:mm")
    );
    const [selectedBusId, setSelectedBusId] = useState(schedule.busId || "");
    const [selectedPrimaryDriverId, setSelectedPrimaryDriverId] = useState(schedule.primaryDriverId || "");
    const [selectedSecondaryDriverId, setSelectedSecondaryDriverId] = useState(schedule.secondaryDriverId || "");

    const handleSubmit = async () => {
        await onSubmit(schedule.id, {
            departureDate,
            departureTime,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Horario</DialogTitle>
                    <DialogDescription>
                        Modifica los detalles del viaje programado
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="departureDate">Fecha de Salida</Label>
                            <Input
                                id="departureDate"
                                type="date"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="departureTime">Hora de Salida</Label>
                            <Input
                                id="departureTime"
                                type="time"
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                            />
                        </div>
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
                        <Label>Conductor Secundario (Opcional)</Label>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 