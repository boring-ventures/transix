import { useState } from "react";
import { Route } from "@/types/route.types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface DeleteRouteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    route: Route;
    onConfirm: (routeId: string) => Promise<void>;
}

export function DeleteRouteDialog({
    open,
    onOpenChange,
    route,
    onConfirm,
}: DeleteRouteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onConfirm(route.id);
            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting route:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Ruta</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la ruta &ldquo;{route.name}
              &rdquo;? Esta acción no se puede deshacer y podría afectar a los
              horarios y viajes programados.
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