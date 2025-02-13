"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusSeatMap } from "@/components/bus/bus-seat-map";
import { useRoutes, useRouteSchedules } from "@/hooks/useRoutes";
import { useLocations } from "@/hooks/useLocations";
import { LoadingTable } from "@/components/table/loading-table";
import { Route, RouteSchedule } from "@/types/route.types";
import { Schedule } from "@/types/schedule.types";
import { BusType } from "@/types/bus.types";

type Passenger = {
  name: string;
  document_id: string;
  seat_number: string;
};

export default function TicketSales() {
  const { toast } = useToast();
  const { data: routes = [], isLoading: isLoadingInitial } = useRoutes();
  const { data: locations = [] } = useLocations();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const { data: schedules, isLoading: isLoadingSchedules } = useRouteSchedules(selectedRoute?.id);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, Passenger>>({});
  const [step, setStep] = useState(1);

  // Mostrar loading solo al cargar inicialmente
  if (isLoadingInitial) {
    return <LoadingTable columnCount={6} rowCount={10} />;
  }

  // Filtrar solo las rutas activas
  const activeRoutes = routes.filter(route => route.active);

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      const newSeats = prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber];

      const newPassengers = { ...passengers };
      if (!prev.includes(seatNumber)) {
        newPassengers[seatNumber] = {
          name: "",
          document_id: "",
          seat_number: seatNumber,
        };
      } else {
        delete newPassengers[seatNumber];
      }
      setPassengers(newPassengers);

      return newSeats;
    });
  };

  const handlePassengerChange = (
    seatNumber: string,
    field: keyof Passenger,
    value: string
  ) => {
    setPassengers((prev) => ({
      ...prev,
      [seatNumber]: { ...prev[seatNumber], [field]: value },
    }));
  };

  const handleSubmit = () => {
    // Here we would save to local storage
    toast({
      title: "Reserva Confirmada",
      description: "Los tickets han sido registrados exitosamente",
    });
    setStep(4);
  };

  const renderStepIndicator = () => {
    return (
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
        <div className="relative flex justify-between">
          {[
            { number: 1, label: "Ruta" },
            { number: 2, label: "Horario" },
            { number: 3, label: "Pasajeros" },
          ].map((s) => (
            <div key={s.number} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white
                  ${
                    s.number <= step
                      ? "border-primary text-primary"
                      : "border-gray-200 text-gray-400"
                  }`}
              >
                {s.number}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  s.number <= step ? "text-primary" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Ruta</h2>
            {activeRoutes.map((route) => {
              const origin = locations.find(loc => loc.id === route.originId);
              const destination = locations.find(loc => loc.id === route.destinationId);
              
              return (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-colors hover:border-primary
                    ${selectedRoute?.id === route.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <CardHeader>
                    <CardTitle>{route.name}</CardTitle>
                    <CardDescription>
                      {origin?.name} - {destination?.name}
                      <br />
                      Duración estimada: {route.estimatedDuration} minutos
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Horario</h2>
            {schedules?.map((schedule) => (
              <Card
                key={schedule.id}
                className={`cursor-pointer transition-colors hover:border-primary
                ${selectedSchedule?.id === schedule.id ? "border-primary bg-primary/5" : ""}`}
                onClick={() => {
                  setSelectedSchedule(schedule);
                  setStep(3);
                  setSelectedSeats([]);
                  setPassengers({});
                }}
              >
                <CardHeader>
                  <CardTitle>
                    {new Date(schedule.departureDate).toLocaleDateString()} - {
                      new Date(schedule.estimatedArrivalTime).toLocaleTimeString()
                    }
                  </CardTitle>
                  <CardDescription>
                    {schedule.routeName} - ${schedule.price / 100}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        );
      case 3:
        const currentSchedule = schedules?.find((s) => s.id === selectedSchedule?.id);
        return currentSchedule?.bus ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Seleccionar Asientos</h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Bus: {currentSchedule.bus.plateNumber}</p>
                <p className="text-sm text-muted-foreground">Tipo: {currentSchedule.bus.template.type}</p>
              </div>
            </div>
            <BusSeatMap
              busType={currentSchedule.bus.template.type as BusType}
              seatsLayout={currentSchedule.bus.template.seatsLayout}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              occupiedSeats={[]} // Aquí podrías obtener los asientos ocupados de la base de datos
              availableSeats={currentSchedule.bus.seats}
            />

            {selectedSeats.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalles de Pasajeros</h3>
                {selectedSeats.map((seatNumber) => (
                  <Card key={seatNumber}>
                    <CardHeader>
                      <CardTitle>Asiento {seatNumber}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`name-${seatNumber}`}>
                            Nombre Completo
                          </Label>
                          <Input
                            id={`name-${seatNumber}`}
                            value={passengers[seatNumber]?.name || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                seatNumber,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`document_id-${seatNumber}`}>
                            Número de Documento
                          </Label>
                          <Input
                            id={`document_id-${seatNumber}`}
                            value={passengers[seatNumber]?.document_id || ""}
                            onChange={(e) =>
                              handlePassengerChange(
                                seatNumber,
                                "document_id",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : null;
      case 4:
        return (
          <div className="text-center space-y-4">
            <Check className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">¡Reserva Confirmada!</h2>
            <p>Su reserva ha sido procesada exitosamente.</p>
            <Button
              onClick={() => {
                setStep(1);
                setSelectedRoute(null);
                setSelectedSchedule(null);
                setSelectedSeats([]);
                setPassengers({});
              }}
            >
              Realizar otra reserva
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Venta de Tickets</h1>

      {step < 4 && renderStepIndicator()}

      <Card>
        <CardContent className="pt-6">{renderStepContent()}</CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && step < 4 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          )}
          {step < 3 && (
            <Button
              className="ml-auto"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !selectedRoute : !selectedSchedule}
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 3 && (
            <Button
              className="ml-auto"
              onClick={handleSubmit}
              disabled={
                selectedSeats.length === 0 ||
                Object.values(passengers).some((p) => !p.name || !p.document_id)
              }
            >
              Confirmar Reserva
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
