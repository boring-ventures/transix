import { useState } from "react";
import { Schedule } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface DeleteScheduleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    schedule: Schedule;
    onConfirm: (scheduleId: string) => Promise<void>;
}

export function DeleteScheduleDialog({
    open,
    onOpenChange,
    schedule,
    onConfirm,
}: DeleteScheduleDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onConfirm(schedule.id);
            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting schedule:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const formattedDate = format(new Date(schedule.departureDate), "dd/MM/yyyy HH:mm");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Eliminar Horario</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar el horario programado para el {formattedDate}?
                        Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 