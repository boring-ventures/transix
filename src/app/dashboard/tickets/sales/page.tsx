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

// Types based on the schema
type Route = {
  id: string;
  name: string;
  originId: string;
  destinationId: string;
  capacity: number;
  seats_taken: number;
  created_at: Date;
  updated_at: Date;
};

type Schedule = {
  id: string;
  route_id: string;
  bus_id: string;
  departure_date: string;
  departure_time: string;
  price: number;
  capacity: number;
  created_at: Date;
  updated_at: Date;
};

type Bus = {
  id: string;
  plate_number: string;
  bus_type: "standard" | "luxury" | "double_decker" | "mini";
  total_capacity: number;
  is_active: boolean;
  maintenance_status: string;
  created_at: Date;
  updated_at: Date;
};

type Passenger = {
  name: string;
  document_id: string;
  seat_number: string;
};

export default function TicketSales() {
  const [step, setStep] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, Passenger>>({});
  const { toast } = useToast();

  // Mock data - this would come from local storage in production
  const routes: Route[] = [
    {
      id: "1",
      name: "La Paz - Santa Cruz",
      originId: "1",
      destinationId: "2",
      capacity: 40,
      seats_taken: 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "2",
      name: "Cochabamba - Sucre",
      originId: "3",
      destinationId: "4",
      capacity: 35,
      seats_taken: 0,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const schedules: Schedule[] = [
    {
      id: "1",
      route_id: "1",
      bus_id: "1",
      departure_date: "2024-01-15",
      departure_time: "09:00",
      price: 150,
      capacity: 40,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "2",
      route_id: "1",
      bus_id: "2",
      departure_date: "2024-01-15",
      departure_time: "14:00",
      price: 150,
      capacity: 40,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const buses: Bus[] = [
    {
      id: "1",
      plate_number: "ABC-123",
      bus_type: "luxury",
      total_capacity: 40,
      is_active: true,
      maintenance_status: "operational",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: "2",
      plate_number: "XYZ-789",
      bus_type: "standard",
      total_capacity: 40,
      is_active: true,
      maintenance_status: "operational",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const getCurrentBus = () => {
    const schedule = schedules.find((s) => s.id === selectedSchedule);
    if (schedule) {
      return buses.find((b) => b.id === schedule.bus_id);
    }
    return null;
  };

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      const newSeats = prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber];

      // Update passengers state
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
            {routes.map((route) => (
              <Card
                key={route.id}
                className={`cursor-pointer transition-colors hover:border-primary
                  ${
                    selectedRoute === route.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                onClick={() => setSelectedRoute(route.id)}
              >
                <CardHeader>
                  <CardTitle>{route.name}</CardTitle>
                  <CardDescription>
                    Capacidad: {route.capacity} pasajeros
                    <br />
                    Asientos ocupados: {route.seats_taken}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Horario</h2>
            {schedules
              .filter((schedule) => schedule.route_id === selectedRoute)
              .map((schedule) => (
                <Card
                  key={schedule.id}
                  className={`cursor-pointer transition-colors hover:border-primary
                    ${
                      selectedSchedule === schedule.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  onClick={() => {
                    setSelectedSchedule(schedule.id);
                    setSelectedSeats([]);
                    setPassengers({});
                  }}
                >
                  <CardHeader>
                    <CardTitle>{schedule.departure_time}</CardTitle>
                    <CardDescription>
                      Fecha: {schedule.departure_date}
                      <br />
                      Precio: Bs. {schedule.price}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
          </div>
        );
      case 3:
        const currentBus = getCurrentBus();
        return currentBus ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Seleccionar Asientos</h2>
            <BusSeatMap
              busType={currentBus.bus_type}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              occupiedSeats={[]} // This would come from local storage
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
                setSelectedRoute("");
                setSelectedSchedule("");
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
