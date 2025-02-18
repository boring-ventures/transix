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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BusSeatMap } from "@/components/bus/bus-seat-map";
import { useRoutes, useRouteSchedules } from "@/hooks/useRoutes";
import { useLocations } from "@/hooks/useLocations";
import { LoadingTable } from "@/components/table/loading-table";
import { Route, RouteSchedule } from "@/types/route.types";
import { Schedule } from "@/types/route.types";
import { BusType } from "@/types/bus.types";
import { Location } from "@/types/route.types";
import { useSchedulesByRouteSchedule } from "@/hooks/useSchedules";

type Passenger = {
  name: string;
  document_id: string;
  seat_number: string;
  price: number;
};

export default function TicketSales() {
  const { toast } = useToast();
  const { data: routes = [], isLoading: isLoadingRoutes } = useRoutes();
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations();
  
  // Estados para el flujo de selección
  const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedRouteSchedule, setSelectedRouteSchedule] = useState<RouteSchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, Passenger>>({});
  const [step, setStep] = useState(1);

  // Obtener horarios cuando se selecciona una ruta
  const { data: routeSchedules = [], isLoading: isLoadingSchedules } = 
    useRouteSchedules(selectedRoute?.id);

  // Add the new hook for fetching schedules
  const { data: availableSchedules = [], isLoading: isLoadingAvailableSchedules } = 
    useSchedulesByRouteSchedule(selectedRouteSchedule?.id);

  // Mostrar loading mientras se cargan los datos iniciales
  if (isLoadingLocations || isLoadingRoutes) {
    return <LoadingTable columnCount={6} rowCount={10} />;
  }

  // Filtrar rutas disponibles basadas en origen/destino seleccionados
  const availableRoutes = routes.filter(route => 
    route.active && 
    (!selectedOrigin || route.originId === selectedOrigin.id) &&
    (!selectedDestination || route.destinationId === selectedDestination.id)
  );

  const handleSeatSelect = (seatNumber: string, price: number) => {
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
          price: price,
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
    // Aquí iría la lógica de guardado
    toast({
      title: "Reserva Confirmada",
      description: "Los tickets han sido registrados exitosamente",
    });
    setStep(6); // Cambiamos a 6 pasos en total
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: "Origen/Destino" },
      { number: 2, label: "Ruta" },
      { number: 3, label: "Horario" },
      { number: 4, label: "Viaje" },
      { number: 5, label: "Pasajeros" },
    ];

    return (
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200" />
        <div className="relative flex justify-between">
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white
                  ${s.number <= step ? "border-primary text-primary" : "border-gray-200 text-gray-400"}`}
              >
                {s.number}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                s.number <= step ? "text-primary" : "text-gray-400"
              }`}>
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
      case 1: // Selección de Origen/Destino
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Seleccionar Origen y Destino</h2>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Origen</Label>
                <Select
                  value={selectedOrigin?.id}
                  onValueChange={(value) => {
                    const origin = locations.find(loc => loc.id === value);
                    setSelectedOrigin(origin || null);
                    setSelectedRoute(null); // Resetear selecciones posteriores
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destino</Label>
                <Select
                  value={selectedDestination?.id}
                  onValueChange={(value) => {
                    const destination = locations.find(loc => loc.id === value);
                    setSelectedDestination(destination || null);
                    setSelectedRoute(null); // Resetear selecciones posteriores
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter(loc => loc.id !== selectedOrigin?.id)
                      .map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2: // Selección de Ruta
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Ruta</h2>
            {availableRoutes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay rutas disponibles para el origen y destino seleccionados
                  </p>
                </CardContent>
              </Card>
            ) : (
              availableRoutes.map((route) => (
                <Card
                  key={route.id}
                  className={`cursor-pointer transition-colors hover:border-primary
                    ${selectedRoute?.id === route.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <CardHeader>
                    <CardTitle>{route.name}</CardTitle>
                    <CardDescription>
                      Duración estimada: {route.estimatedDuration} minutos
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        );

      case 3: // Selección de Horario Recurrente
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Horario</h2>
            {isLoadingSchedules ? (
              <LoadingTable columnCount={3} rowCount={5} />
            ) : routeSchedules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay horarios disponibles para esta ruta
                  </p>
                </CardContent>
              </Card>
            ) : (
              routeSchedules.map((schedule) => (
                <Card
                  key={schedule.id}
                  className={`cursor-pointer transition-colors hover:border-primary
                    ${selectedRouteSchedule?.id === schedule.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedRouteSchedule(schedule)}
                >
                  <CardHeader>
                    <CardTitle>
                      {new Date(`1970-01-01T${schedule.departureTime}`).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </CardTitle>
                    <CardDescription>
                      Días de operación: {schedule.operatingDays.join(", ")}
                      {schedule.seasonStart && schedule.seasonEnd && (
                        <div>
                          Temporada: {new Date(schedule.seasonStart).toLocaleDateString()} - {new Date(schedule.seasonEnd).toLocaleDateString()}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        );

      case 4: // Selección de Viaje Específico
        if (!selectedRouteSchedule) return null;

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Viaje</h2>
            {isLoadingAvailableSchedules ? (
              <LoadingTable columnCount={3} rowCount={5} />
            ) : availableSchedules.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No hay viajes disponibles para este horario
                  </p>
                </CardContent>
              </Card>
            ) : (
              availableSchedules.map((schedule) => (
                <Card
                  key={schedule.id}
                  className={`cursor-pointer transition-colors hover:border-primary
                    ${selectedSchedule?.id === schedule.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedSchedule(schedule)}
                >
                  <CardHeader>
                    <CardTitle>
                      {new Date(schedule.departureDate).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription>
                      Salida: {new Date(schedule.departureDate).toLocaleTimeString()}
                      <br />
                      Llegada est.: {new Date(schedule.estimatedArrivalTime).toLocaleTimeString()}
                      {schedule.busAssignments?.[0]?.bus && (
                        <div>
                          Bus: {schedule.busAssignments[0].bus.plateNumber}
                          {schedule.busAssignments[0].bus.template && 
                            ` (${schedule.busAssignments[0].bus.template.name})`}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        );

      case 5: // Selección de Asientos y Datos de Pasajeros
        if (!selectedSchedule) return null;

        const currentBus = selectedSchedule.busAssignments?.[0]?.bus;
        
        if (!currentBus) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay un bus asignado a este horario. Por favor, seleccione otro horario o contacte al administrador.
              </p>
            </div>
          );
        }

        console.log('Current Bus:', currentBus);
        console.log('Bus Template:', currentBus.template);
        console.log('Seat Template Matrix:', currentBus.template?.seatTemplateMatrix);
        console.log('Bus Seats:', currentBus.seats);

        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Seleccionar Asientos</h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Bus: {currentBus.plateNumber}</p>
                <p className="text-sm text-muted-foreground">Tipo: {currentBus.template?.name}</p>
              </div>
            </div>

            {currentBus.template?.seatTemplateMatrix ? (
              <BusSeatMap
                busType={currentBus.template.type as BusType}
                seatsLayout={JSON.stringify({
                  firstFloor: {
                    dimensions: currentBus.template.seatTemplateMatrix.firstFloor.dimensions,
                    seats: currentBus.template.seatTemplateMatrix.firstFloor.seats.map(templateSeat => {
                      const busSeat = currentBus.seats?.find(s => s.seatNumber === templateSeat.name);
                      return {
                        ...templateSeat,
                        status: busSeat?.status || 'unavailable'
                      };
                    })
                  },
                  secondFloor: currentBus.template.seatTemplateMatrix.secondFloor ? {
                    dimensions: currentBus.template.seatTemplateMatrix.secondFloor.dimensions,
                    seats: currentBus.template.seatTemplateMatrix.secondFloor.seats.map(templateSeat => {
                      const busSeat = currentBus.seats?.find(s => s.seatNumber === templateSeat.name);
                      return {
                        ...templateSeat,
                        status: busSeat?.status || 'unavailable'
                      };
                    })
                  } : undefined
                })}
                selectedSeats={selectedSeats}
                onSeatSelect={(seatName) => {
                  const busSeat = currentBus.seats?.find(s => s.seatNumber === seatName);
                  if (busSeat && busSeat.tier) {
                    handleSeatSelect(seatName, Number(busSeat.tier.basePrice));
                  }
                }}
                seatPrices={Object.fromEntries(
                  (currentBus.seats || [])
                    .filter(seat => seat.tier)
                    .map(seat => [seat.seatNumber, Number(seat.tier?.basePrice)])
                )}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  La distribución de asientos no está disponible para este bus.
                </p>
              </div>
            )}

            {selectedSeats.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalles de Pasajeros</h3>
                {selectedSeats.map((seatNumber) => (
                  <Card key={seatNumber}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Asiento {seatNumber}</span>
                        <span className="text-sm text-muted-foreground">
                          Precio: ${passengers[seatNumber]?.price.toFixed(2)}
                        </span>
                      </CardTitle>
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
        );

      case 6: // Confirmación
        return (
          <div className="text-center space-y-4">
            <Check className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-semibold">¡Reserva Confirmada!</h2>
            <p>Su reserva ha sido procesada exitosamente.</p>
            <Button
              onClick={() => {
                setStep(1);
                setSelectedOrigin(null);
                setSelectedDestination(null);
                setSelectedRoute(null);
                setSelectedRouteSchedule(null);
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

      {step < 6 && renderStepIndicator()}

      <Card>
        <CardContent className="pt-6">{renderStepContent()}</CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && step < 6 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          )}
          {step < 5 && (
            <Button
              className="ml-auto"
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && (!selectedOrigin || !selectedDestination)) ||
                (step === 2 && !selectedRoute) ||
                (step === 3 && !selectedRouteSchedule) ||
                (step === 4 && !selectedSchedule)
              }
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          {step === 5 && (
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
