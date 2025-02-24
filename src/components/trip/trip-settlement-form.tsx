"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTripSettlement, useCreateTripSettlement, useUpdateTripSettlement } from "@/hooks/useTrips";
import type { Schedule } from "@/types/route.types";
import { settlement_status_enum } from "@prisma/client";
import { Printer } from "lucide-react";

interface TripSettlementFormProps {
    scheduleId: string;
    schedule: Schedule;
}

export function TripSettlementForm({ scheduleId, schedule }: TripSettlementFormProps) {
    const { toast } = useToast();
    const { data: settlement, isLoading: isLoadingSettlement } = useTripSettlement(scheduleId);
    const createSettlement = useCreateTripSettlement();
    const updateSettlement = useUpdateTripSettlement();

    const [formData, setFormData] = useState({
        totalIncome: settlement?.totalIncome || 0,
        totalExpenses: settlement?.totalExpenses || 0,
        details: settlement?.details || {
            fares: [],
            expenses: [],
            packages: 0,
        },
    });

    if (isLoadingSettlement) {
        return <div>Cargando...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        if (settlement) {
          await updateSettlement.mutateAsync({
            scheduleId,
            data: {
              totalIncome: formData.totalIncome,
              totalExpenses: formData.totalExpenses,
              details: formData.details,
              status: settlement_status_enum.pending,
            },
          });
          toast({
            title: "Liquidación actualizada",
            description: "La liquidación se ha actualizado correctamente",
          });
        } else {
          await createSettlement.mutateAsync({
            scheduleId,
            ...formData,
          });
          toast({
            title: "Liquidación creada",
            description: "La liquidación se ha creado correctamente",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Ha ocurrido un error al guardar la liquidación",
          variant: "destructive",
        });
      }
    };

    const handleSettle = async () => {
      try {
        await updateSettlement.mutateAsync({
          scheduleId,
          data: {
            totalIncome: formData.totalIncome,
            totalExpenses: formData.totalExpenses,
            details: formData.details,
            status: settlement_status_enum.settled,
          },
        });
        toast({
          title: "Liquidación finalizada",
          description: "La liquidación se ha marcado como finalizada",
        });
      } catch {
        toast({
          title: "Error",
          description: "Ha ocurrido un error al finalizar la liquidación",
          variant: "destructive",
        });
      }
    };

    const handlePrint = () => {
      window.print();
    };

    return (
      <div className="space-y-6">
        {/* Versión imprimible */}
        <div className="hidden print:block space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Boleta de Liquidación</h1>
            <p className="text-sm text-gray-600">
              {format(new Date(), "PPP", { locale: es })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Ruta:</strong> {schedule.route?.name}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {format(new Date(schedule.departureDate), "PPP", {
                  locale: es,
                })}
              </p>
              <p>
                <strong>Bus:</strong>{" "}
                {schedule.bus?.plateNumber || "No asignado"}
              </p>
            </div>
            <div>
              <p>
                <strong>Estado:</strong>{" "}
                {settlement?.status === "settled" ? "Finalizada" : "Pendiente"}
              </p>
              <p>
                <strong>Ingreso Total:</strong> ${formData.totalIncome}
              </p>
              <p>
                <strong>Gastos Totales:</strong> ${formData.totalExpenses}
              </p>
              <p>
                <strong>Monto Neto:</strong> $
                {formData.totalIncome - formData.totalExpenses}
              </p>
            </div>
          </div>

          {settlement?.status === "settled" && (
            <div className="mt-8 pt-8 border-t">
              <p className="text-center">
                <strong>Fecha de Liquidación:</strong>{" "}
                {settlement.settledAt
                  ? format(new Date(settlement.settledAt), "PPP", {
                      locale: es,
                    })
                  : "-"}
              </p>
            </div>
          )}
        </div>

        {/* Versión para pantalla */}
        <div className="print:hidden">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={handlePrint}
              disabled={!settlement || settlement.status !== "settled"}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Liquidación
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liquidación del Viaje</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalIncome">Ingreso Total</Label>
                  <Input
                    id="totalIncome"
                    type="number"
                    value={formData.totalIncome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalIncome: Number.parseFloat(e.target.value),
                      })
                    }
                    disabled={settlement?.status === "settled"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalExpenses">Gastos Totales</Label>
                  <Input
                    id="totalExpenses"
                    type="number"
                    value={formData.totalExpenses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalExpenses: Number.parseFloat(e.target.value),
                      })
                    }
                    disabled={settlement?.status === "settled"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packages">Monto de Encomiendas</Label>
                  <Input
                    id="packages"
                    type="number"
                    value={formData.details.packages}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        details: {
                          ...formData.details,
                          packages: Number.parseFloat(e.target.value),
                        },
                      })
                    }
                    disabled={settlement?.status === "settled"}
                  />
                </div>
                {settlement?.status !== "settled" && (
                  <div className="flex gap-2">
                    <Button type="submit">
                      {settlement ? "Actualizar" : "Crear"} Liquidación
                    </Button>
                    {settlement && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSettle}
                      >
                        Finalizar Liquidación
                      </Button>
                    )}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
} 