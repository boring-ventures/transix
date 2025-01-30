import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BusTypeTemplate, CompanyResponse } from "@/types/bus.types";
import { SeatMatrixPreview } from "./seat-matrix-preview";
import { useSeatTiers } from "@/hooks/useSeatTiers";

interface ViewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: BusTypeTemplate;
  companies: CompanyResponse[];
}

export const ViewTemplateModal = ({
  isOpen,
  onClose,
  template,
  companies,
}: ViewTemplateModalProps) => {
  const { data: seatTiers } = useSeatTiers();
  const company = companies.find((c) => c.id === template.companyId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalles de la Plantilla</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Nombre</h4>
              <p>{template.name}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Compañía</h4>
              <p>{company?.name || "Sin compañía"}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Capacidad Total</h4>
              <p>{template.totalCapacity} asientos</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Fecha de Creación</h4>
              <p>
                {template.createdAt
                  ? new Date(template.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Descripción</h4>
            <p className="text-sm text-muted-foreground">
              {template.description || "Sin descripción"}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Configuración de Asientos</h4>
            <div className="border rounded-lg p-4 bg-muted/50">
              <SeatMatrixPreview
                matrix={template.seatTemplateMatrix}
                seatTiers={seatTiers || []}
                className="justify-center"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
