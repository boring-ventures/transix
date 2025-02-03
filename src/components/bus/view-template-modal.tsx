import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BusTypeTemplate, SeatTemplateMatrix } from "@/types/bus.types";
import { SeatMatrixPreview } from "./seat-matrix-preview";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import { Badge } from "@/components/ui/badge";
import { Company } from "@/types/company.types";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getTierColor } from "@/lib/seat-tier-colors";

interface ViewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: BusTypeTemplate;
  companies: Company[];
}

export const ViewTemplateModal = ({
  isOpen,
  onClose,
  template,
  companies,
}: ViewTemplateModalProps) => {
  const { data: seatTiers } = useSeatTiers();
  const company = companies.find((c) => c.id === template.companyId);
  const seatMatrix = template.seatTemplateMatrix as SeatTemplateMatrix;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Detalles de la Plantilla</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="preview" className="flex-1 flex flex-col">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start gap-6 rounded-none border-b-0 pl-0">
              <TabsTrigger
                value="preview"
                className="relative rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary"
              >
                Vista Previa
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="relative rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary"
              >
                Detalles
              </TabsTrigger>
            </TabsList>
          </div>
          <ScrollArea className="flex-1">
            <TabsContent value="preview" className="m-0">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Vista Superior del Bus
                  </h2>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center mb-4">
                    <h3 className="text-base font-medium">
                      Distribución de Asientos
                    </h3>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-1">
                      <div
                        className={cn(
                          "grid gap-6",
                          seatMatrix.secondFloor ? "grid-cols-2" : "grid-cols-1"
                        )}
                      >
                        <div
                          className={cn(
                            !seatMatrix.secondFloor &&
                              "max-w-2xl mx-auto w-full"
                          )}
                        >
                          <h4 className="text-sm font-medium mb-2">
                            Primer Piso
                          </h4>
                          <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[350px] w-full">
                            <div className="w-full h-full flex items-center justify-center p-8">
                              <div className="w-fit max-w-full max-h-full">
                                <SeatMatrixPreview
                                  matrix={seatMatrix}
                                  seatTiers={seatTiers || []}
                                  className="justify-center"
                                  floor={1}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {seatMatrix.secondFloor && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Segundo Piso
                            </h4>
                            <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[350px] w-full">
                              <div className="w-full h-full flex items-center justify-center p-8">
                                <div className="w-fit max-w-full max-h-full">
                                  <SeatMatrixPreview
                                    matrix={seatMatrix}
                                    seatTiers={seatTiers || []}
                                    className="justify-center"
                                    floor={2}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-4 mt-4">
                        <Badge variant="outline" className="bg-background">
                          ← Izquierda
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          Frente
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          Derecha →
                        </Badge>
                      </div>
                    </div>

                    {/* Leyenda de Tipos de Asiento */}
                    <div className="w-64 border-l pl-6">
                      <h3 className="text-sm font-medium mb-3">
                        Leyenda de Tipos de Asiento
                      </h3>
                      <div className="flex flex-col gap-2">
                        {seatTiers?.map((tier, index) => {
                          const colorClass = getTierColor(index);
                          return (
                            <div
                              key={tier.id}
                              className="flex items-center gap-2 px-3 py-1.5 border rounded-lg"
                            >
                              <div
                                className={cn(
                                  "w-4 h-4 rounded-full border",
                                  colorClass.bg,
                                  colorClass.border
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {tier.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ${parseFloat(tier.basePrice).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="m-0">
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold">Información General</h2>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Nombre
                    </h4>
                    <p className="text-lg font-semibold">{template.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Compañía
                    </h4>
                    <p className="text-lg">{company?.name || "Sin compañía"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Capacidad Total
                    </h4>
                    <p className="text-lg">{template.totalCapacity} asientos</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Fecha de Creación
                    </h4>
                    <p className="text-lg">
                      {template.createdAt
                        ? new Date(template.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Descripción
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {template.description || "Sin descripción"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
