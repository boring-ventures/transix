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
import type { Route, RouteSchedule } from "@/types/route.types";
import type { Location } from "@/types/route.types";
import { useSchedulesByRouteSchedule } from "@/hooks/useSchedules";
import { StepIndicator } from "../../../../components/tickets/step-indicator";
import { OriginDestinationStep } from "../../../../components/tickets/origin-destination-step";
import { RouteSelectionStep } from "../../../../components/tickets/route-selection-step";
import { SALES_STEPS } from "./types";
import { ReservationPDF } from "../../../../components/tickets/reservation-pdf";
import { TicketPDF } from "../../../../components/tickets/ticket-pdf";
import { InvoicePDF } from "../../../../components/tickets/invoice-pdf";

type Passenger = {
  name: string;
  document_id: string;
  seatId: string; // El UUID real del asiento
  seatLabel: string; // El label visible (ej. "4C")
  price: number;
};

type TicketWithCustomerData = {
  schedule_id: string;
  customer_id: string;
  bus_seat_id: string;
  status: string;
  price: number;
  customerData: {
    fullName: string;
    documentId: string;
    phone: string;
    email: string;
    seatNumber: string;
  };
  notes: string;
  purchased_by: string | null;
  purchased_at: Date;
};

type ConfirmedReservation = {
  reservationId: string;
  tickets: TicketWithCustomerData[];
  totalAmount: number;
  schedule: {
    departureDate: string;
    departureTime: string;
    route: string;
  };
  purchaseTime?: string;
};

// Add these type definitions at the top of the file after the imports
type ActiveTicket = {
  bus_seat_id: string;
  status: string;
};

// Add these type definitions at the top of the file
type Seat = {
  id: string;
  name: string;
  tierId: string;
  row: number;
  column: number;
  isEmpty: boolean;
  status: string;
  tier?: {
    id: string;
    name: string;
    basePrice: number;
  };
  seatNumber: string;
};

type SeatTier = {
  id: string;
  name: string;
  basePrice: number;
};

// Add these type definitions at the top of the file
type Bus = {
  id: string;
  plateNumber: string;
  template?: {
    name: string;
    seatTemplateMatrix?: {
      firstFloor: {
        dimensions: {
          rows: number;
          seatsPerRow: number;
        };
        seats: Seat[];
      };
      secondFloor?: {
        dimensions: {
          rows: number;
          seatsPerRow: number;
        };
        seats: Seat[];
      };
    };
  };
  seats: Seat[];
};

type ScheduleDetails = {
  id: string;
  departureDate: string;
  estimatedArrivalTime: string;
  bus?: Bus;
};

// Add these type definitions at the top of the file
type SeatTemplate = {
  id: string;
  name: string;
  row: number;
  column: number;
  tierId: string;
  status: string;
};

export default function TicketSales() {
  const { toast } = useToast();
  const { data: routes = [], isLoading: isLoadingRoutes } = useRoutes();
  const { data: locations = [], isLoading: isLoadingLocations } =
    useLocations();

  // Filtrar rutas disponibles basadas en origen/destino seleccionados
  const availableRoutes = routes.filter(
    (route) =>
      route.active &&
      (!selectedOrigin || route.originId === selectedOrigin.id) &&
      (!selectedDestination || route.destinationId === selectedDestination.id)
  );

  // Estados para el flujo de selección
  const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Location | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedRouteSchedule, setSelectedRouteSchedule] =
    useState<RouteSchedule | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Record<string, Passenger>>({});
  const [step, setStep] = useState(1);
  // Estados para datos comunes para el ticket (se aplican a todos los asientos seleccionados)
  const [commonPassengerName, setCommonPassengerName] = useState("");
  const [commonDocumentId, setCommonDocumentId] = useState("");
  // Nuevos estados para almacenar teléfono y email del cliente
  const [commonPhone, setCommonPhone] = useState("");
  const [commonEmail, setCommonEmail] = useState("");

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
  const [confirmedReservation, setConfirmedReservation] =
    useState<ConfirmedReservation | null>(null);

  // Modify the showPDF state to handle both PDFs
  const [showTicketPDF, setShowTicketPDF] = useState(false);
  const [showInvoicePDF, setShowInvoicePDF] = useState(false);

  // Estado para la lógica de asientos (consulta de niveles)
  const { data: seatTiers } = useSeatTiers();

  // Agregar un nuevo estado para los tickets activos
  const [activeTickets, setActiveTickets] = useState<{
    [key: string]: boolean;
  }>({});

  // Agregar una función para cargar los tickets activos cuando se selecciona un schedule
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadActiveTickets = async (scheduleId: string) => {
    try {
      const response = await fetch(
        `/api/tickets/active?scheduleId=${scheduleId}`
      );
      if (!response.ok) throw new Error("Error loading tickets");
      const tickets: ActiveTicket[] = await response.json();

      const ticketsMap = tickets.reduce<Record<string, boolean>>(
        (acc, ticket) => {
          acc[ticket.bus_seat_id] = true;
          return acc;
        },
        {}
      );

      setActiveTickets(ticketsMap);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error loading active tickets:", errorMessage);
      setActiveTickets({});
    }
  };

  // Modificar el useEffect cuando se selecciona un schedule
  useEffect(() => {
    if (selectedSchedule?.id) {
      void loadActiveTickets(selectedSchedule.id);
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  }, [selectedSchedule, loadActiveTickets]);

  // Función para consultar el cliente en base a su document_id
  const checkCustomer = async (docId: string) => {
    if (!docId) return;
    try {
      const response = await fetch(`/api/customers?documentId=${docId}`);
      if (response.ok) {
        const data = await response.json();
        if (data?.full_name) {
          // Cliente encontrado: actualizar el estado y los inputs con los datos del cliente
          setCustomerData({
            id: data.id, // Asegurarse de guardar el id
            full_name: data.full_name,
            phone: data.phone || "",
            email: data.email || "",
          });
          // Solo se reemplazan los datos si se encontró un cliente
          setCommonPassengerName(data.full_name);
          setCommonPhone(data.phone || "");
          setCommonEmail(data.email || "");
        } else {
          setCustomerData(null);
          // No borrar los datos ya ingresados en el formulario
          // Los campos commonPassengerName, commonPhone y commonEmail se mantienen intactos.
        }
      } else {
        setCustomerData(null);
        // No borrar los datos ya ingresados en el formulario
      }
    } catch {
      setCustomerData(null);
      // No borrar los datos ya ingresados en el formulario
    }
  };

  // Mostrar loading mientras se cargan los datos iniciales
  if (isLoadingLocations || isLoadingRoutes) {
    return <LoadingTable columnCount={6} rowCount={10} />;
  }

  // Update the seat selection logic
  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) => {
      const newSeats = prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId];
      return newSeats;
    });
  };

  // Update the submit handler
  const handleSubmit = async () => {
    const schedule = selectedSchedule;
    const route = selectedRoute;

    if (!schedule || !route) {
      toast({
        title: "Error",
        description: "Por favor seleccione un horario y ruta",
        variant: "destructive",
      });
      return;
    }

    try {
      let filledPassengers = passengers;
      if (
        selectedSeats.length > 0 &&
        Object.keys(filledPassengers).length === 0
      ) {
        const currentBus = schedule.bus;
        const newPassengers: Record<string, Passenger> = {};

        for (const seatId of selectedSeats) {
          const seatObj = currentBus?.seats.find((s: Seat) => s.id === seatId);
          const tier = seatTiers?.find(
            (t: SeatTier) => t.id === seatObj?.tier?.id
          );
          const price = tier ? Number(tier.basePrice) : 0;

          if (seatObj) {
            newPassengers[seatId] = {
              name: commonPassengerName,
              document_id: commonDocumentId,
              seatId: seatId,
              seatLabel: seatObj.seatNumber,
              price: price,
            };
          }
        }
        filledPassengers = newPassengers;
      }

      // Create tickets array
      const ticketsToCreate = selectedSeats.map((seatId) => ({
        schedule_id: schedule.id,
        customer_id: customerData?.id ?? "",
        bus_seat_id: seatId,
        status: "active",
        price: filledPassengers[seatId]?.price ?? 0,
        customerData: {
          fullName: commonPassengerName,
          documentId: commonDocumentId,
          phone: commonPhone,
          email: commonEmail,
          seatNumber: filledPassengers[seatId]?.seatLabel ?? "",
        },
        notes: "",
        purchased_by: null,
        purchased_at: new Date(),
      }));

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tickets: ticketsToCreate }),
      });

      if (!response.ok) {
        throw new Error("Failed to create tickets");
      }

      const data = await response.json();
      setConfirmedReservation({
        reservationId: data.id,
        tickets: ticketsToCreate,
        totalAmount: ticketsToCreate.reduce((acc, t) => acc + t.price, 0),
        schedule: {
          departureDate: new Date(schedule.departureDate).toLocaleDateString(),
          departureTime: new Date(schedule.departureDate).toLocaleTimeString(),
          route: route.name,
        },
      });

      setStep(SALES_STEPS[5].number);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      console.error("Error creating tickets:", errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    if (!selectedRouteSchedule?.bus?.template?.seatTemplateMatrix?.firstFloor) {
      return null;
    }

    switch (step) {
      case SALES_STEPS[0].number: {
        return (
          <OriginDestinationStep
            locations={locations}
            selectedOrigin={selectedOrigin}
            selectedDestination={selectedDestination}
            onOriginChange={setSelectedOrigin}
            onDestinationChange={setSelectedDestination}
          />
        );
      }

      case SALES_STEPS[1].number: {
        return (
          <RouteSelectionStep
            availableRoutes={availableRoutes}
            selectedRoute={selectedRoute}
            onRouteSelect={setSelectedRoute}
          />
        );
      }

      case SALES_STEPS[2].number: {
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Horario</h2>
            {isLoadingSchedules ? (
              <LoadingTable />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routeSchedules?.map((schedule: RouteSchedule) => (
                  <Card
                    key={schedule.id}
                    className={`cursor-pointer transition-colors hover:border-primary ${
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
                            {new Date(
                              schedule.seasonStart
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(schedule.seasonEnd).toLocaleDateString()}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      }

      case SALES_STEPS[3].number: {
        if (!selectedRouteSchedule) return null;

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Seleccionar Viaje</h2>
            {isLoadingAvailableSchedules ? (
              <LoadingTable />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSchedules?.map((schedule) => (
                  <Card
                    key={schedule.id}
                    className={`cursor-pointer transition-colors hover:border-primary ${
                      selectedSchedule?.id === schedule.id
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedSchedule({
                        id: schedule.id,
                        departureDate: schedule.departureDate.toISOString(),
                        estimatedArrivalTime:
                          schedule.estimatedArrivalTime.toISOString(),
                        bus: schedule.bus && {
                          id: schedule.bus.id,
                          plateNumber: schedule.bus.plateNumber,
                          template: schedule.bus.template && {
                            name: schedule.bus.template.name,
                            seatTemplateMatrix: schedule.bus.template
                              .seatTemplateMatrix && {
                              firstFloor: {
                                dimensions:
                                  schedule.bus.template.seatTemplateMatrix
                                    .firstFloor.dimensions,
                                seats:
                                  schedule.bus.template.seatTemplateMatrix.firstFloor.seats.map(
                                    (s) => ({
                                      ...s,
                                      status: "available",
                                      seatNumber: s.name,
                                    })
                                  ),
                              },
                            },
                          },
                          seats: schedule.bus.seats.map((s) => ({
                            id: s.id,
                            name: s.seatNumber,
                            tierId: s.tier?.id || "",
                            row: 0,
                            column: 0,
                            isEmpty: false,
                            status: s.status,
                            seatNumber: s.seatNumber,
                            tier: s.tier,
                          })),
                        },
                      })
                    }
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
                        {schedule.bus && (
                          <div>
                            Bus: {schedule.bus.plateNumber}
                            {schedule.bus.template &&
                              ` (${schedule.bus.template.name})`}
                          </div>
                        )}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      }

      case SALES_STEPS[4].number: {
        if (!selectedSchedule?.bus) return null;

        const currentBus = selectedSchedule.bus;
        const seatTemplateMatrix = currentBus.template?.seatTemplateMatrix;
        let templateData = null;

        if (seatTemplateMatrix) {
          templateData =
            typeof seatTemplateMatrix === "string"
              ? JSON.parse(seatTemplateMatrix)
              : seatTemplateMatrix;
        }

        const totalPrice = selectedSeats.reduce((acc, seatId) => {
          const seatObj = currentBus.seats.find((s: Seat) => s.id === seatId);
          const tier = seatTiers?.find(
            (t: SeatTier) => t.id === seatObj?.tier?.id
          );
          return acc + (tier ? Number(tier.basePrice) : 0);
        }, 0);

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda: Mapa de asientos */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">
                Seleccionar Asiento
              </h2>
              {templateData ? (
                <div
                  className="grid gap-4"
                  // Se genera el grid dinámico según la cantidad de columnas definida
                  style={{
                    gridTemplateColumns: `repeat(${templateData.firstFloor.dimensions.seatsPerRow}, 1fr)`,
                  }}
                >
                  {renderSeats(currentBus.seats, templateData)}
                </div>
              ) : (
                // Fallback: si no hay plantilla, se usa la lógica anterior
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {currentBus.seats.map((seat: Seat) => {
                    const tier = seatTiers?.find(
                      (t: SeatTier) => t.id === seat.tier?.id
                    );
                    const price = tier ? Number(tier.basePrice) : 0;
                    const isSelected = selectedSeats.includes(seat.id);
                    const colorsMapping: { [key: string]: string } = {
                      Economico: "green",
                      Normal: "red",
                      VIP: "blue",
                    };
                    const seatColor = seat.tier
                      ? colorsMapping[seat.tier.name] || "gray"
                      : "gray";

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
                    const borderClass = isSelected
                      ? "border-2 border-blue-500"
                      : "border border-transparent";

                    return (
                      <button
                        key={seat.id}
                        disabled={
                          activeTickets[seat.id] ||
                          (seat.status !== "available" && !isSelected)
                        }
                        type="button"
                        onClick={() => handleSeatSelect(seat.id)}
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
                          <span className="text-xs mt-1">{`Bs. ${price.toFixed(
                            2
                          )}`}</span>
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
                    {Object.values(passengers)
                      .map((p) => p.seatLabel)
                      .join(", ")}
                  </div>
                  <div className="mb-4">
                    <span className="font-bold">Total: </span>
                    <span>{`Bs. ${totalPrice.toFixed(2)}`}</span>
                  </div>
                  {renderPassengerForm()}
                </div>
              )}
            </div>
          </div>
        );
      }

      case SALES_STEPS[5].number: // Confirmación
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
                  <h3 className="text-lg font-semibold mb-4">
                    Detalles de la Reserva
                  </h3>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Número de Reserva
                      </dt>
                      <dd className="text-lg font-medium">
                        {confirmedReservation.reservationId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Ruta</dt>
                      <dd className="text-lg font-medium">
                        {confirmedReservation.schedule.route}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Fecha de Salida
                      </dt>
                      <dd className="text-lg font-medium">
                        {confirmedReservation.schedule.departureDate}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">
                        Hora de Salida
                      </dt>
                      <dd className="text-lg font-medium">
                        {confirmedReservation.schedule.departureTime}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border rounded-lg">
                  <h4 className="text-lg font-semibold p-4 border-b">
                    Tickets
                  </h4>
                  <div className="divide-y">
                    {confirmedReservation.tickets.map((ticket) => {
                      return (
                        <div
                          key={ticket.bus_seat_id}
                          className="p-4 grid grid-cols-5 gap-4"
                        >
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Asiento
                            </p>
                            <p className="font-medium">
                              {ticket.customerData.seatNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Pasajero
                            </p>
                            <p className="font-medium">
                              {ticket.customerData.fullName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Documento
                            </p>
                            <p className="font-medium">
                              {ticket.customerData.documentId}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Categoría
                            </p>
                            <p className="font-medium">
                              {!Number.isNaN(Number(ticket.customerData.seatNumber))
                                ? Number(ticket.customerData.seatNumber) <= 4
                                  ? "VIP"
                                  : Number(ticket.customerData.seatNumber) <= 8
                                  ? "Ejecutivo"
                                  : "Económico"
                                : "Económico"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Precio
                            </p>
                            <p className="font-medium">Bs. {ticket.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t bg-muted">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold">
                        Bs. {confirmedReservation.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowTicketPDF(!showTicketPDF)}
                  >
                    {showTicketPDF ? "Ocultar Boletos" : "Ver Boletos"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInvoicePDF(!showInvoicePDF)}
                  >
                    {showInvoicePDF ? "Ocultar Factura" : "Ver Factura"}
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

                {showTicketPDF && (
                  <div className="mt-4">
                    <ReservationPDF
                      reservation={{
                        ...confirmedReservation,
                        tickets: confirmedReservation.tickets.map((ticket) => ({
                          seatNumber: ticket.customerData.seatNumber,
                          passengerName: ticket.customerData.fullName,
                          documentId: ticket.customerData.documentId,
                          price: ticket.price,
                        })),
                      }}
                    />
                  </div>
                )}

                {showTicketPDF && confirmedReservation && (
                  <div className="mt-4 space-y-4">
                    {confirmedReservation.tickets.map((ticket) => (
                      <TicketPDF
                        key={ticket.bus_seat_id}
                        ticket={{
                          seatNumber: ticket.customerData.seatNumber,
                          passengerName: ticket.customerData.fullName,
                          documentId: ticket.customerData.documentId,
                          price: Number(ticket.price),
                        }}
                        schedule={confirmedReservation.schedule}
                        reservationId={confirmedReservation.reservationId}
                      />
                    ))}
                  </div>
                )}

                {showInvoicePDF && confirmedReservation && (
                  <div className="mt-4">
                    <InvoicePDF
                      invoiceData={{
                        invoiceNumber: confirmedReservation.reservationId,
                        customerName:
                          confirmedReservation.tickets[0].customerData.fullName,
                        customerId:
                          confirmedReservation.tickets[0].customerData
                            .documentId,
                        customerPhone:
                          confirmedReservation.tickets[0].customerData.phone,
                        customerEmail:
                          confirmedReservation.tickets[0].customerData.email,
                        tickets: confirmedReservation.tickets.map((ticket) => ({
                          seatNumber: ticket.customerData.seatNumber,
                          price: Number(ticket.price),
                        })),
                        totalAmount: Number(confirmedReservation.totalAmount),
                        date: new Date().toLocaleDateString(),
                        route: confirmedReservation.schedule.route,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSeatButton = (
    seat: SeatTemplate,
    realSeatId: string,
    isSelected: boolean,
    tier: SeatTier | undefined,
    price: number
  ) => {
    const colorsMapping: Record<string, string> = {
      Standard: "gray",
      Premium: "green",
      VIP: "blue",
    };

    const seatColor = tier?.name ? colorsMapping[tier.name] ?? "gray" : "gray";
    const bgClass = activeTickets[realSeatId]
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : isSelected
      ? `bg-${seatColor}-200`
      : `bg-${seatColor}-100`;

    const borderClass = isSelected
      ? "border-2 border-blue-500"
      : "border border-transparent";

    return (
      <button
        key={realSeatId}
        type="button"
        disabled={
          activeTickets[realSeatId] ||
          (seat.status !== "available" && !isSelected)
        }
        onClick={() => handleSeatSelect(realSeatId)}
        className={`p-4 rounded ${bgClass} ${borderClass} hover:opacity-80 flex flex-col items-center`}
        aria-label={`Asiento ${seat.name} - ${
          isSelected
            ? "Seleccionado"
            : activeTickets[realSeatId]
            ? "Ocupado"
            : "Disponible"
        }`}
      >
        <span className="font-medium">{seat.name}</span>
        <Badge variant={isSelected ? "default" : "secondary"}>
          {isSelected
            ? "Seleccionado"
            : activeTickets[realSeatId]
            ? "Ocupado"
            : "Disponible"}
        </Badge>
        {tier && (
          <span className="text-xs mt-1">{`Bs. ${price.toFixed(2)}`}</span>
        )}
      </button>
    );
  };

  const renderSeats = (
    seats: Seat[],
    templateData: { firstFloor: { seats: SeatTemplate[] } }
  ) => {
    return templateData.firstFloor.seats.map((seat) => {
      const realSeatId =
        seats.find((s) => s.seatNumber === seat.name)?.id ?? "";
      const tier = seatTiers?.find((t) => t.id === seat.tierId);
      const price = tier ? Number(tier.basePrice) : 0;
      const isSelected = selectedSeats.includes(realSeatId);

      return renderSeatButton(seat, realSeatId, isSelected, tier, price);
    });
  };

  const renderPassengerForm = () => {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <label
            htmlFor="documentId"
            className="block text-sm font-medium text-gray-700"
          >
            Documento de Identidad
          </label>
          <input
            id="documentId"
            type="text"
            value={commonDocumentId}
            onChange={(e) => {
              setCommonDocumentId(e.target.value);
              checkCustomer(e.target.value);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="passengerName"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre Completo
          </label>
          <input
            id="passengerName"
            type="text"
            value={commonPassengerName}
            onChange={(e) => setCommonPassengerName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            value={commonPhone}
            onChange={(e) => setCommonPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Correo Electrónico
          </label>
          <input
            id="email"
            type="email"
            value={commonEmail}
            onChange={(e) => setCommonEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>
    );
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
              type="submit"
              className="ml-auto"
              onClick={handleSubmit}
              disabled={
                !commonPassengerName ||
                !commonDocumentId ||
                selectedSeats.length === 0
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
