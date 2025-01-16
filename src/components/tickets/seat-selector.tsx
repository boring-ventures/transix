"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { busTypeEnum, seatTierEnum } from "@/db/schema";
import { SeatSelection } from "@/types/ticket.types";

interface SeatSelectorProps {
  selectedSeat: string;
  onSeatSelect: (seatNumber: string) => void;
  busType: (typeof busTypeEnum.enumValues)[number];
  seatTier: (typeof seatTierEnum.enumValues)[number];
}

export function SeatSelector({
  selectedSeat,
  onSeatSelect,
  busType,
  seatTier,
}: SeatSelectorProps) {
  // Mock data for seat layout
  const [seats] = useState<SeatSelection[]>(() => {
    const totalSeats = busType === "double_decker" ? 80 : 40;
    return Array.from({ length: totalSeats }, (_, index) => {
      const row = Math.floor(index / 4) + 1;
      const col = (index % 4) + 1;
      const seatNumber = `${String.fromCharCode(64 + row)}${col}`;
      return {
        seatNumber,
        tier: seatTier,
        isAvailable: Math.random() > 0.3, // 70% seats available
        isSelected: false,
        price: seatTier === "luxury" ? 100 : seatTier === "business" ? 75 : 50,
      };
    });
  });

  const handleSeatClick = (seatNumber: string) => {
    const seat = seats.find((s) => s.seatNumber === seatNumber);
    if (seat?.isAvailable) {
      onSeatSelect(seatNumber);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center mb-4 space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <span className="text-sm">Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <span className="text-sm">Seleccionado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-400 rounded"></div>
          <span className="text-sm">Ocupado</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
        {seats.map((seat) => (
          <button
            key={seat.seatNumber}
            onClick={() => handleSeatClick(seat.seatNumber)}
            disabled={!seat.isAvailable}
            className={cn(
              "w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors",
              seat.isAvailable
                ? selectedSeat === seat.seatNumber
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-400 cursor-not-allowed"
            )}
          >
            {seat.seatNumber}
          </button>
        ))}
      </div>

      {selectedSeat && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Detalles del Asiento</h4>
          <p className="text-sm">
            Asiento: <span className="font-medium">{selectedSeat}</span>
          </p>
          <p className="text-sm">
            Precio:{" "}
            <span className="font-medium">
              Bs.{" "}
              {seats
                .find((seat) => seat.seatNumber === selectedSeat)
                ?.price.toFixed(2)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
