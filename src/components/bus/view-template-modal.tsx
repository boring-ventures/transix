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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
          <ScrollArea className="h-[calc(800px-6rem)]">
            <TabsContent value="preview" className="m-0 p-6">
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Vista Superior del Bus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <Badge variant="outline" className="bg-background">
                          ← Izquierda
                        </Badge>
                        <Badge variant="outline" className="bg-background">
                          Derecha →
                        </Badge>
                      </div>
                      <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-10 bg-background">
                        <SeatMatrixPreview
                          matrix={
                            template.seatTemplateMatrix as SeatTemplateMatrix
                          }
                          seatTiers={seatTiers || []}
                          className="justify-center scale-[2] origin-center"
                        />
                      </div>
                      <div className="flex justify-center mt-6">
                        <Badge variant="outline" className="bg-background">
                          Frente
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Niveles de Asiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
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
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <div
                              className={`w-6 h-6 rounded border ${colorClass}`}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{tier.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${parseFloat(tier.basePrice).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="m-0 p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información General</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
