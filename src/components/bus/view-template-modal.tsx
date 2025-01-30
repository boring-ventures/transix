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
      <DialogContent className="max-w-[1000px] h-[800px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Detalles de la Plantilla</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="preview" className="flex-1">
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
          <ScrollArea className="h-[calc(800px-8rem)]">
            <TabsContent value="preview" className="m-0">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Vista Superior del Bus
                  </h2>
                </div>

                <div className="flex flex-col">
                  <Tabs defaultValue="floor1" className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <TabsList>
                        <TabsTrigger value="floor1">Primer Piso</TabsTrigger>
                        {seatMatrix.secondFloor && (
                          <TabsTrigger value="floor2">Segundo Piso</TabsTrigger>
                        )}
                      </TabsList>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-background">
                          ← Izquierda
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          Derecha →
                        </Badge>
                      </div>
                    </div>

                    <div className="min-h-[400px]">
                      <TabsContent value="floor1" className="mt-0">
                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-background flex items-center justify-center min-h-[400px]">
                          <SeatMatrixPreview
                            matrix={seatMatrix}
                            seatTiers={seatTiers || []}
                            className="justify-center scale-[2] origin-center"
                            floor={1}
                          />
                        </div>
                      </TabsContent>

                      {seatMatrix.secondFloor && (
                        <TabsContent value="floor2" className="mt-0">
                          <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 bg-background flex items-center justify-center min-h-[400px]">
                            <SeatMatrixPreview
                              matrix={seatMatrix}
                              seatTiers={seatTiers || []}
                              className="justify-center scale-[2] origin-center"
                              floor={2}
                            />
                          </div>
                        </TabsContent>
                      )}
                    </div>
                  </Tabs>

                  <div className="mt-6 flex flex-col gap-6">
                    <div className="flex justify-center">
                      <Badge variant="outline" className="bg-background">
                        Frente
                      </Badge>
                    </div>

                    {/* Leyenda de Niveles */}
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-3">
                        Leyenda de Niveles
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {seatTiers?.map((tier, index) => {
                          const colorVariants = {
                            purple: "bg-purple-200 border-purple-300",
                            blue: "bg-blue-200 border-blue-300",
                            green: "bg-green-200 border-green-300",
                            yellow: "bg-yellow-200 border-yellow-300",
                            pink: "bg-pink-200 border-pink-300",
                          };
                          const colors = Object.values(colorVariants);
                          const colorClass = colors[index % colors.length];

                          return (
                            <div
                              key={tier.id}
                              className="flex items-center gap-2 px-3 py-1.5 border rounded-full"
                            >
                              <div
                                className={`w-4 h-4 rounded-full border ${colorClass}`}
                              />
                              <span className="text-sm font-medium">
                                {tier.name}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                ${parseFloat(tier.basePrice).toFixed(2)}
                              </span>
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
