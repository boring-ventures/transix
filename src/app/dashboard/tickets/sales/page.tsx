"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRoutes, useRouteSchedules } from "@/hooks/useRoutes";
import { useLocations } from "@/hooks/useLocations";
import { LoadingTable } from "@/components/table/loading-table";
import { Route, RouteSchedule } from "@/types/route.types";
import { Schedule } from "@/types/route.types";
import { Location } from "@/types/route.types";
import { useSchedulesByRouteSchedule } from "@/hooks/useSchedules";
import { StepIndicator } from "../../../../components/tickets/step-indicator";
import { OriginDestinationStep } from "../../../../components/tickets/origin-destination-step";
import { RouteSelectionStep } from "../../../../components/tickets/route-selection-step";
import { SALES_STEPS } from "./types";
import { SeatSelectionStep } from "../../../../components/tickets/seat-selection-step";
import { ReservationPDF } from "../../../../components/tickets/reservation-pdf";

type Passenger = {
  name: string;
  document_id: string;
  seatId: string;       // El UUID real del asiento
  seatLabel: string;    // El label visible (ej. "4C")
  price: number;
};

export default function TicketSales() {
  const { toast } = useToast();
  const { data: routes = [], isLoading: isLoadingRoutes } = useRoutes();
  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocations();

  // Estados para el flujo de selección
  const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedRouteSchedule, setSelectedRouteSchedule] =
    useState<RouteSchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, Passenger>>({});
  const [step, setStep] = useState(1);
  // Estados para datos comunes para el ticket (se aplican a todos los asientos seleccionados)
  const [commonPassengerName, setCommonPassengerName] = useState("");
  const [commonDocumentId, setCommonDocumentId] = useState("");
  // Nuevos estados para almacenar teléfono y email del cliente
  const [commonPhone, setCommonPhone] = useState("");
  const [commonEmail, setCommonEmail] = useState("");

  // Agregamos nuevos estados para el lookup del cliente
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [customerData, setCustomerData] = useState<{ 
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  } | null>(null);

  // Obtener horarios cuando se selecciona una ruta
  const { data: routeSchedules = [], isLoading: isLoadingSchedules } =
    useRouteSchedules(selectedRoute?.id);

  // Add the new hook for fetching schedules
  const {
    data: availableSchedules = [],
    isLoading: isLoadingAvailableSchedules,
  } = useSchedulesByRouteSchedule(selectedRouteSchedule?.id);

  // In the TicketSales component, add this state
  const [confirmedReservation, setConfirmedReservation] = useState<{
    reservationId: string;
    tickets: {
      schedule_id: string;
      customer_id: string | null;
      bus_seat_id: string;
      status: string;
      price: number;
      notes: string;
      purchased_by: string | null;
      purchased_at: Date;
    }[];
    totalAmount: number;
    schedule: {
      departureDate: string;
      departureTime: string;
      route: string;
    };
    purchaseTime?: string;
  } | null>(null);

  // Add this state
  const [showPDF, setShowPDF] = useState(false);

  // Estado para la lógica de asientos (consulta de niveles)
  const { data: seatTiers } = useSeatTiers();

  // Agregar un nuevo estado para los tickets activos
  const [activeTickets, setActiveTickets] = useState<{
    [key: string]: boolean;
  }>({});

  // Agregar una función para cargar los tickets activos cuando se selecciona un schedule
  const loadActiveTickets = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/tickets/active?scheduleId=${scheduleId}`);
      if (!response.ok) throw new Error('Error loading tickets');
      const tickets = await response.json();
      
      // Crear un objeto con los bus_seat_id como claves
      const ticketsMap = tickets.reduce((acc: any, ticket: any) => {
        acc[ticket.bus_seat_id] = true;
        return acc;
      }, {});
      
      setActiveTickets(ticketsMap);
    } catch (error) {
      console.error('Error loading active tickets:', error);
      setActiveTickets({});
    }
  };

  // Modificar el useEffect cuando se selecciona un schedule
  useEffect(() => {
    if (selectedSchedule?.id) {
      loadActiveTickets(selectedSchedule.id);
    }
  }, [selectedSchedule]);

  // Función para consultar el cliente en base a su document_id
  const checkCustomer = async (docId: string) => {
    if (!docId) return;
    setLookupStatus("loading");
    try {
      const response = await fetch(`/api/customers?documentId=${docId}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.full_name) {
          // Cliente encontrado: actualizar el estado y los inputs con los datos del cliente
          setCustomerData({
            id: data.id,           // Asegurarse de guardar el id
            full_name: data.full_name,
            phone: data.phone || "",
            email: data.email || ""
          });
          setLookupStatus("found");
          // Solo se reemplazan los datos si se encontró un cliente
          setCommonPassengerName(data.full_name);
          setCommonPhone(data.phone || "");
          setCommonEmail(data.email || "");
        } else {
          setLookupStatus("not_found");
          setCustomerData(null);
          // No borrar los datos ya ingresados en el formulario
          // Los campos commonPassengerName, commonPhone y commonEmail se mantienen intactos.
        }
      } else {
        setLookupStatus("not_found");
        setCustomerData(null);
        // No borrar los datos ya ingresados en el formulario
      }
    } catch (error) {
      setLookupStatus("not_found");
      setCustomerData(null);
      // No borrar los datos ya ingresados en el formulario
    }
  };

  // Nueva función para registrar un nuevo cliente
  const registerCustomer = async (): Promise<{
    id: string;
    full_name: string;
    phone?: string;
    email?: string;
  }> => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: commonDocumentId,
          full_name: commonPassengerName,
          phone: commonPhone,
          email: commonEmail,
        }),
      });
      if (!response.ok) {
        throw new Error("Error al registrar el cliente");
      }
      const newCustomer = await response.json();
      setCustomerData({
        id: newCustomer.id,
        full_name: newCustomer.full_name,
        phone: newCustomer.phone || "",
        email: newCustomer.email || "",
      });
      return newCustomer;
    } catch (error) {
      console.error("Error al registrar cliente", error);
      throw error;
    }
  };

  // Mostrar loading mientras se cargan los datos iniciales
  if (isLoadingLocations || isLoadingRoutes) {
    return <LoadingTable columnCount={6} rowCount={10} />;
  }

  // Filtrar rutas disponibles basadas en origen/destino seleccionados
  const availableRoutes = routes.filter(
    (route) =>
      route.active &&
      (!selectedOrigin || route.originId === selectedOrigin.id) &&
      (!selectedDestination || route.destinationId === selectedDestination.id)
  );

  const handleSeatSelect = (seatId: string, price: number, seatLabel: string) => {
    setSelectedSeats((prev) => {
      const newSeats = prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId];

      const newPassengers = { ...passengers };
      if (!prev.includes(seatId)) {
        newPassengers[seatId] = {
          name: "",
          document_id: "",
          seatId: seatId,
          seatLabel: seatLabel,
          price: price,
        };
      } else {
        delete newPassengers[seatId];
      }
      setPassengers(newPassengers);

      return newSeats;
    });
  };

  const handleSubmit = async () => {
    try {
      // Registrar el cliente si no existe antes de crear los tickets
      let effectiveCustomer = customerData;
      if (!effectiveCustomer) {
        effectiveCustomer = await registerCustomer();
      }

      // Si no se han registrado tickets individualmente (es decir, no se ha llamado a handleRegisterTickets),
      // se autocompletan usando los datos comunes y cada asiento seleccionado.
      let filledPassengers = passengers;
      if (selectedSeats.length > 0 && Object.keys(filledPassengers).length === 0) {
        const currentBus = selectedSchedule!.busAssignments?.[0]?.bus;
        const newPassengers: Record<string, Passenger> = {};
        selectedSeats.forEach((seatId) => {
          const seatObj = currentBus?.seats.find((s: any) => s.id === seatId);
          const tier = seatTiers?.find((t: any) => t.id === seatObj?.tier?.id);
          const price = tier ? Number(tier.basePrice) : 0;
          newPassengers[seatId] = {
            name: commonPassengerName,
            document_id: commonDocumentId,
            seatId: seatId,
            seatLabel: seatObj?.seatNumber ?? seatId,
            price: price,
          };
        });
        filledPassengers = newPassengers;
      }

      const ticketsToCreate = Object.entries(filledPassengers).map(
        ([seatId, passenger]) => ({
          schedule_id: selectedSchedule!.id,
          customer_id: effectiveCustomer.id, // Usar el id del cliente registrado
          bus_seat_id: seatId,
          status: "active" as const,
          price: passenger.price,
          notes: `Pasajero: ${passenger.name}, Documento: ${passenger.document_id}`,
          purchased_by: null,
          purchased_at: new Date(),
        })
      );

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tickets: ticketsToCreate }),
      });

      if (!response.ok) {
        throw new Error("Error al crear los tickets");
      }

      const createdTickets = await response.json();
      
      setConfirmedReservation({
        reservationId: `RES-${Math.random().toString(36).substr(2, 9)}`,
        tickets: createdTickets,
        totalAmount: Object.values(filledPassengers).reduce(
          (sum, p) => sum + p.price,
          0
        ),
        schedule: {
          departureDate: new Date(selectedSchedule!.departureDate).toLocaleDateString(),
          departureTime: new Date(selectedSchedule!.departureDate).toLocaleTimeString(),
          route: selectedRoute!.name,
        },
        purchaseTime: new Date().toLocaleTimeString(),
      });

      toast({
        title: "Reserva Confirmada",
        description: "Los tickets han sido registrados exitosamente",
      });
      setStep(6);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al crear los tickets",
        variant: "destructive",
      });
    }
  };

  const handleTicketCreate = (ticketData: {
    seatId: string;
    seatLabel: string;
    customerName: string;
    documentId: string;
    phone?: string;
    email?: string;
    notes?: string;
    price: number;
  }) => {
    setPassengers((prev) => ({
      ...prev,
      [ticketData.seatId]: {
        name: ticketData.customerName,
        document_id: ticketData.documentId,
        seatId: ticketData.seatId,
        seatLabel: ticketData.seatLabel,
        price: ticketData.price,
      },
    }));

    toast({
      title: "Ticket Creado",
      description: "El ticket ha sido creado exitosamente",
    });
  };

  // Nueva función para registrar tickets para todos los asientos seleccionados utilizando datos comunes
  const handleRegisterTickets = () => {
    if (!selectedSchedule) return;
    const currentBus = selectedSchedule.busAssignments?.[0]?.bus;
    if (!currentBus) return;

    selectedSeats.forEach((seatId) => {
      // Buscar el asiento usando el UUID (seat.id)
      const seatObj = currentBus.seats.find((s: any) => s.id === seatId);
      const tier = seatTiers?.find((t: any) => t.id === seatObj?.tier?.id);
      const price = tier ? Number(tier.basePrice) : 0;
      handleTicketCreate({
        seatId: seatId,
        seatLabel: seatObj?.seatNumber ?? seatId, // Usa el label o, si no se encuentra, el id
        customerName: commonPassengerName,
        documentId: commonDocumentId,
        price: price,
      });
    });
    toast({
      title: "Tickets Registrados",
      description: "Los tickets han sido creados para los asientos seleccionados",
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <OriginDestinationStep
            locations={locations}
            selectedOrigin={selectedOrigin}
            selectedDestination={selectedDestination}
            onOriginChange={(origin) => {
              setSelectedOrigin(origin);
              setSelectedRoute(null);
            }}
            onDestinationChange={(destination) => {
              setSelectedDestination(destination);
              setSelectedRoute(null);
            }}
          />
        );

      case 2:
        return (
          <RouteSelectionStep
            availableRoutes={availableRoutes}
            selectedRoute={selectedRoute}
            onRouteSelect={setSelectedRoute}
          />
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
                    ${
                      selectedRouteSchedule?.id === schedule.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  onClick={() => setSelectedRouteSchedule(schedule)}
                >
                  <CardHeader>
                    <CardTitle>
                      {new Date(
                        `1970-01-01T${schedule.departureTime}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardTitle>
                    <CardDescription>
                      Días de operación: {schedule.operatingDays.join(", ")}
                      {schedule.seasonStart && schedule.seasonEnd && (
                        <div>
                          Temporada:{" "}
                          {new Date(schedule.seasonStart).toLocaleDateString()}{" "}
                          - {new Date(schedule.seasonEnd).toLocaleDateString()}
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
                    ${
                      selectedSchedule?.id === schedule.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                  onClick={() => setSelectedSchedule(schedule)}
                >
                  <CardHeader>
                    <CardTitle>
                      {new Date(schedule.departureDate).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription>
                      Salida:{" "}
                      {new Date(schedule.departureDate).toLocaleTimeString()}
                      <br />
                      Llegada est.:{" "}
                      {new Date(
                        schedule.estimatedArrivalTime
                      ).toLocaleTimeString()}
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

      case 5:
        if (!selectedSchedule) return null;

        const currentBus = selectedSchedule.busAssignments?.[0]?.bus;

        if (!currentBus) {
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay un bus asignado a este horario. Por favor, seleccione
                otro horario o contacte al administrador.
              </p>
            </div>
          );
        }
        
        // Se obtiene la plantilla desde la relación "bus_type_templates" y el campo "seat_template_matrix"
        const seatTemplateMatrix = currentBus.template?.seatTemplateMatrix;
        let templateData = null;
        if (seatTemplateMatrix) {
          templateData = typeof seatTemplateMatrix === "string" ? JSON.parse(seatTemplateMatrix) : seatTemplateMatrix;
        }
        
        // Calculamos el precio total usando la plantilla (de lo contrario se usa el método anterior)
        let totalPrice = 0;
        if (templateData) {
          const { rows, seatsPerRow } = templateData.firstFloor.dimensions;
          totalPrice = selectedSeats.reduce((acc: number, seatId: string) => {
            // Buscar el asiento real por su id (UUID)
            const seatObj = currentBus.seats.find((s: any) => s.id === seatId);
            const tier = seatTiers?.find((t: any) => t.id === seatObj?.tier?.id);
            const price = tier ? Number(tier.basePrice) : 0;
            return acc + price;
          }, 0);
        } else {
          totalPrice = selectedSeats.reduce((acc: number, seatId: string) => {
            // Se modifica para usar el id real en lugar de seatNumber
            const seatObj = currentBus.seats.find((s: any) => s.id === seatId);
            const tier = seatTiers?.find((t: any) => t.id === seatObj?.tier?.id);
            const price = tier ? Number(tier.basePrice) : 0;
            return acc + price;
          }, 0);
        }

        return (
          <div className="flex flex-col md:flex-row md:space-x-6">
            {/* Columna izquierda: Mapa de asientos */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Seleccionar Asiento</h2>
              {templateData ? (
                <div
                  className="grid gap-4"
                  // Se genera el grid dinámico según la cantidad de columnas definida
                  style={{
                    gridTemplateColumns: `repeat(${templateData.firstFloor.dimensions.seatsPerRow}, 1fr)`,
                  }}
                >
                  {Array.from({
                    length:
                      templateData.firstFloor.dimensions.rows *
                      templateData.firstFloor.dimensions.seatsPerRow,
                  }).map((_, index) => {
                    const row = Math.floor(
                      index / templateData.firstFloor.dimensions.seatsPerRow
                    );
                    const col = index % templateData.firstFloor.dimensions.seatsPerRow;
                    const seat = templateData.firstFloor.seats.find(
                      (s: any) => s.row === row && s.column === col
                    );
                    if (!seat) {
                      return <div key={index} />;
                    }

                    // Buscar el asiento real en currentBus.seats usando que el número visible coincide
                    const realSeat = currentBus.seats.find(
                      (s: any) => s.seatNumber === seat.name
                    );
                    // Se utiliza el id real si se encontró; de lo contrario se usa el valor de la plantilla
                    const realSeatId = realSeat?.id || seat.id;
                    const isSelected = selectedSeats.includes(realSeatId);

                    // Calcular precio a partir del tier (se puede mejorar obteniendo el tier del asiento real)
                    const tier = seatTiers?.find((t: any) => t.id === seat.tierId);
                    const price = tier ? Number(tier.basePrice) : 0;

                    const colorsMapping: { [key: string]: string } = {
                      Economico: "green",
                      Normal: "red",
                      VIP: "blue",
                    };
                    const seatColor = tier ? (colorsMapping[tier.name] || "gray") : "gray";
                    let bgClass = "";
                    if (activeTickets[realSeatId]) {
                      bgClass = "bg-red-100 text-red-800"; // Para asientos comprados
                    } else if (seat.status === "maintenance") {
                      bgClass = "bg-yellow-100 text-yellow-800";
                    } else if (seat.status === "available") {
                      bgClass = `bg-${seatColor}-100 hover:bg-${seatColor}-200`;
                    } else {
                      bgClass = "bg-gray-100 text-gray-800";
                    }
                    const borderClass = isSelected
                      ? "border-2 border-blue-500"
                      : "border border-transparent";

                    return (
                      <button
                        key={realSeatId}
                        disabled={activeTickets[realSeatId] || (seat.status !== "available" && !isSelected)}
                        onClick={() => handleSeatSelect(realSeatId, price, seat.name)}
                        className={`p-4 rounded ${bgClass} ${borderClass} hover:opacity-80 flex flex-col items-center`}
                      >
                        <span className="font-bold">{seat.name}</span>
                        <Badge variant="outline" className={bgClass}>
                          {activeTickets[realSeatId]
                            ? "Comprado"
                            : seat.status === "maintenance"
                            ? "Mantenimiento"
                            : seat.status === "available"
                            ? "Disponible"
                            : "Deshabilitado"}
                        </Badge>
                        {tier && <span className="text-xs mt-1">{`$${price.toFixed(2)}`}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                // Fallback: si no hay plantilla, se usa la lógica anterior
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {currentBus.seats.map((seat: any) => {
                    const tier = seatTiers?.find((t: any) => t.id === seat.tier?.id);
                    const price = tier ? Number(tier.basePrice) : 0;
                    const isSelected = selectedSeats.includes(seat.id);
                    const colorsMapping: { [key: string]: string } = {
                      Economico: "green",
                      Normal: "red",
                      VIP: "blue",
                    };
                    const seatColor = seat.tier ? (colorsMapping[seat.tier.name] || "gray") : "gray";

                    let bgClass = "";
                    if (activeTickets[seat.id]) {
                      bgClass = "bg-red-100 text-red-800"; // Para asientos comprados
                    } else if (seat.status === "maintenance") {
                      bgClass = "bg-yellow-100 text-yellow-800";
                    } else if (seat.status === "available") {
                      bgClass = `bg-${seatColor}-100 hover:bg-${seatColor}-200`;
                    } else {
                      bgClass = "bg-gray-100 text-gray-800";
                    }
                    const borderClass = isSelected ? "border-2 border-blue-500" : "border border-transparent";

                    return (
                      <button
                        key={seat.id}
                        disabled={activeTickets[seat.id] || (seat.status !== "available" && !isSelected)}
                        onClick={() => handleSeatSelect(seat.id, price, seat.seatNumber)}
                        className={`p-4 rounded ${bgClass} ${borderClass} hover:opacity-80 flex flex-col items-center`}
                      >
                        <span className="font-bold">{seat.name}</span>
                        <Badge variant="outline" className={bgClass}>
                          {activeTickets[seat.id]
                            ? "Comprado"
                            : seat.status === "maintenance"
                            ? "Mantenimiento"
                            : seat.status === "available"
                            ? "Disponible"
                            : "Deshabilitado"}
                        </Badge>
                        {tier && (
                          <span className="text-xs mt-1">{`$${price.toFixed(2)}`}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Columna derecha: Formulario para registrar el ticket con datos comunes */}
            <div className="w-full md:w-1/3">
              <h2 className="text-xl font-semibold mb-4">Registrar Ticket</h2>
              {selectedSeats.length === 0 ? (
                <p className="text-muted-foreground">
                  No se ha seleccionado ningún asiento.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <span className="font-bold">Asientos seleccionados: </span>
                    {Object.values(passengers).map(p => p.seatLabel).join(", ")}
                  </div>
                  <div className="mb-4">
                    <span className="font-bold">Total: </span>
                    <span>{`$${totalPrice.toFixed(2)}`}</span>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm">Nombre del pasajero</label>
                    <input
                      type="text"
                      value={commonPassengerName}
                      onChange={(e) => setCommonPassengerName(e.target.value)}
                      className="border rounded p-2 w-full bg-white text-black"
                      placeholder="Ingrese el nombre"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm">Documento</label>
                    <input
                      type="text"
                      value={commonDocumentId}
                      onChange={(e) => setCommonDocumentId(e.target.value)}
                      onBlur={() => {
                        if (commonDocumentId.trim() !== "") {
                          checkCustomer(commonDocumentId);
                        }
                      }}
                      className="border rounded p-2 w-full bg-white text-black"
                      placeholder="Ingrese el documento"
                    />
                    {lookupStatus === "loading" && (
                      <p className="text-sm text-gray-500 mt-1">Buscando cliente...</p>
                    )}
                    {lookupStatus === "found" && (
                      <p className="text-sm text-green-500 mt-1">Cliente encontrado</p>
                    )}
                    {lookupStatus === "not_found" && (
                      <p className="text-sm text-red-500 mt-1">Cliente no encontrado</p>
                    )}
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm">Teléfono</label>
                    <input
                      type="text"
                      value={commonPhone}
                      onChange={(e) => setCommonPhone(e.target.value)}
                      className="border rounded p-2 w-full bg-white text-black"
                      placeholder="Ingrese el teléfono"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm">Email</label>
                    <input
                      type="email"
                      value={commonEmail}
                      onChange={(e) => setCommonEmail(e.target.value)}
                      className="border rounded p-2 w-full bg-white text-black"
                      placeholder="Ingrese el email"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6: // Confirmación
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Check className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold">¡Reserva Confirmada!</h2>
              <p>Su reserva ha sido procesada exitosamente.</p>
            </div>

            {confirmedReservation && (
              <div className="mt-8 space-y-6">
                <div className="bg-muted p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Detalles de la Reserva</h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Número de Reserva</dt>
                      <dd className="text-lg font-medium">{confirmedReservation.reservationId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Ruta</dt>
                      <dd className="text-lg font-medium">{confirmedReservation.schedule.route}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Fecha de Salida</dt>
                      <dd className="text-lg font-medium">{confirmedReservation.schedule.departureDate}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Hora de Salida</dt>
                      <dd className="text-lg font-medium">{confirmedReservation.schedule.departureTime}</dd>
                    </div>
                  </dl>
                </div>

                <div className="border rounded-lg">
                  <h4 className="text-lg font-semibold p-4 border-b">Tickets</h4>
                  <div className="divide-y">
                    {confirmedReservation.tickets.map((ticket) => {
                      const ticketData = passengers[ticket.bus_seat_id] || {};
                      return (
                        <div key={ticket.bus_seat_id} className="p-4 grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Asiento</p>
                            <p className="font-medium">{ticketData.seatLabel || ticket.bus_seat_id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Pasajero</p>
                            <p className="font-medium">{ticketData.name ?? ticket.customer_id ?? ""}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Documento</p>
                            <p className="font-medium">{ticketData.document_id || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Precio</p>
                            <p className="font-medium">${ticket.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t bg-muted">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold">
                        ${confirmedReservation.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowPDF(!showPDF)}
                  >
                    {showPDF ? "Ocultar PDF" : "Ver PDF"}
                  </Button>
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
                      setConfirmedReservation(null);
                    }}
                  >
                    Realizar otra reserva
                  </Button>
                </div>

                {showPDF && (
                  <div className="mt-4">
                    <ReservationPDF 
                      reservation={{
                        ...confirmedReservation,
                        tickets: confirmedReservation.tickets.map(ticket => {
                          const ticketData = passengers[ticket.bus_seat_id] || {};
                          return {
                            seatNumber: ticketData.seatLabel || ticket.bus_seat_id,
                            passengerName: ticketData.name ?? ticket.customer_id ?? "",
                            documentId: ticketData.document_id || "N/A",
                            price: ticket.price
                          };
                        })
                      }} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Venta de Tickets</h1>

      {step < 6 && <StepIndicator currentStep={step} steps={SALES_STEPS} />}

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
              disabled={!commonPassengerName || !commonDocumentId || selectedSeats.length === 0}
            >
              Confirmar Reserva
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
