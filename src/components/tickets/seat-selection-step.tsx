import { useState } from "react";
import { BusSeatMap } from "@/components/bus/bus-seat-map";
import { TicketForm } from "./ticket-form";
import { Bus } from "@/types/bus.types";
import { useSeatTiers } from "@/hooks/useSeatTiers";

interface SeatSelectionStepProps {
  currentBus: Bus;
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string, price: number) => void;
  onTicketCreate: (ticketData: {
    seatId: string;
    customerName: string;
    documentId: string;
    phone?: string;
    email?: string;
    notes?: string;
    price: number;
  }) => void;
}

const DUMMY_SEAT_DATA = {
  firstFloor: {
    dimensions: { rows: 4, seatsPerRow: 4 },
    seats: Array.from({ length: 16 }, (_, i) => ({
      id: `seat-${i + 1}`,
      name: `${i + 1}`,
      tierId: i < 4 ? "vip" : i < 8 ? "ejecutivo" : "economico",
      row: Math.floor(i / 4),
      column: i % 4,
      isEmpty: false,
      status: "available"
    }))
  }
};

export function SeatSelectionStep({
  currentBus,
  selectedSeats,
  onSeatSelect,
  onTicketCreate,
}: SeatSelectionStepProps) {
  const { data: seatTiers } = useSeatTiers();
  const [selectedSeat, setSelectedSeat] = useState<{
    number: string;
    id: string;
    tier: { name: string; basePrice: number };
  } | null>(null);

  const handleSeatSelect = (
    seatNumber: string,
    seatData: {
      id: string;
      tierId: string;
      tier?: {
        id: string;
        name: string;
        basePrice: number;
      };
    }
  ) => {
    if (!seatData.tier) return;

    setSelectedSeat({
      number: seatNumber,
      id: seatData.id,
      tier: {
        name: seatData.tier.name,
        basePrice: Number(seatData.tier.basePrice),
      },
    });
    onSeatSelect(seatNumber, Number(seatData.tier.basePrice));
  };

  const handleTicketSubmit = (formData: {
    customerName: string;
    documentId: string;
    phone?: string;
    email?: string;
    notes?: string;
  }) => {
    if (!selectedSeat) return;

    onTicketCreate({
      seatId: selectedSeat.number,
      price: selectedSeat.tier.basePrice,
      ...formData,
    });
    setSelectedSeat(null);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Seleccionar Asientos</h2>
        <BusSeatMap
          seatsLayout={JSON.stringify({
            firstFloor: {
              dimensions: DUMMY_SEAT_DATA.firstFloor.dimensions,
              seats: DUMMY_SEAT_DATA.firstFloor.seats.map(seat => ({
                ...seat,
                tier: {
                  id: seat.tierId,
                  name: seat.tierId === "vip" ? "VIP" : 
                        seat.tierId === "ejecutivo" ? "Ejecutivo" : "Económico",
                  basePrice: seat.tierId === "vip" ? 100 : 
                           seat.tierId === "ejecutivo" ? 75 : 50
                }
              }))
            }
          })}
          selectedSeats={selectedSeats}
          onSeatSelect={handleSeatSelect}
          seatTiers={[
            { id: "vip", name: "VIP", basePrice: 100 },
            { id: "ejecutivo", name: "Ejecutivo", basePrice: 75 },
            { id: "economico", name: "Económico", basePrice: 50 }
          ]}
          seatPrices={{
            vip: 100,
            ejecutivo: 75,
            economico: 50
          }}
        />
      </div>

      <div>
        {selectedSeat && (
          <TicketForm
            seatNumber={selectedSeat.number}
            seatTier={selectedSeat.tier}
            onSubmit={handleTicketSubmit}
            onCancel={() => setSelectedSeat(null)}
          />
        )}
      </div>
    </div>
  );
}
