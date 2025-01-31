"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SeatTier = "economy" | "business" | "premium";
export type BusType = "standard" | "luxury" | "double_decker" | "mini";

interface Seat {
  number: string;
  tier: SeatTier;
  isSelected?: boolean;
  isOccupied?: boolean;
}

interface BusSeatMapProps {
  busType: BusType;
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  occupiedSeats?: string[];
}

export function BusSeatMap({
  busType,
  selectedSeats,
  onSeatSelect,
  occupiedSeats = [],
}: BusSeatMapProps) {
  const getBusLayout = (type: BusType): (Seat | null)[][] => {
    switch (type) {
      case "standard":
        return [
          [
            { number: "1", tier: "economy" },
            { number: "2", tier: "economy" },
            null,
            { number: "3", tier: "economy" },
            { number: "4", tier: "economy" },
          ],
          [
            { number: "5", tier: "economy" },
            { number: "6", tier: "economy" },
            null,
            { number: "7", tier: "economy" },
            { number: "8", tier: "economy" },
          ],
          [
            { number: "9", tier: "business" },
            { number: "10", tier: "business" },
            null,
            { number: "11", tier: "business" },
            { number: "12", tier: "business" },
          ],
        ];
      case "luxury":
        return [
          [
            { number: "1", tier: "premium" },
            null,
            { number: "2", tier: "premium" },
          ],
          [
            { number: "3", tier: "premium" },
            null,
            { number: "4", tier: "premium" },
          ],
          [
            { number: "5", tier: "business" },
            null,
            { number: "6", tier: "business" },
          ],
          [
            { number: "7", tier: "business" },
            null,
            { number: "8", tier: "business" },
          ],
        ];
      case "double_decker":
        return [
          // First floor
          [
            { number: "1", tier: "premium" },
            { number: "2", tier: "premium" },
            null,
            { number: "3", tier: "premium" },
            { number: "4", tier: "premium" },
          ],
          [
            { number: "5", tier: "business" },
            { number: "6", tier: "business" },
            null,
            { number: "7", tier: "business" },
            { number: "8", tier: "business" },
          ],
          // Second floor
          [
            { number: "9", tier: "economy" },
            { number: "10", tier: "economy" },
            null,
            { number: "11", tier: "economy" },
            { number: "12", tier: "economy" },
          ],
          [
            { number: "13", tier: "economy" },
            { number: "14", tier: "economy" },
            null,
            { number: "15", tier: "economy" },
            { number: "16", tier: "economy" },
          ],
        ];
      case "mini":
        return [
          [
            { number: "1", tier: "business" },
            null,
            { number: "2", tier: "business" },
          ],
          [
            { number: "3", tier: "economy" },
            null,
            { number: "4", tier: "economy" },
          ],
          [
            { number: "5", tier: "economy" },
            null,
            { number: "6", tier: "economy" },
          ],
        ];
      default:
        return [];
    }
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      "12312": "bg-red-100 hover:bg-red-200 border-red-200",
      VIP: "bg-red-200 hover:bg-red-300 border-red-300",
      "Tester 2": "bg-gray-100 hover:bg-gray-200 border-gray-200",
      Regular: "bg-gray-200 hover:bg-gray-300 border-gray-300",
      default: "bg-red-50 hover:bg-red-100 border-red-100",
    };

    return colors[tier] || colors.default;
  };

  const layout = getBusLayout(busType);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Bus shape container */}
      <div className="relative bg-gray-100 rounded-lg p-8">
        {/* Driver's area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gray-300 rounded-t-full" />

        {/* Seats container */}
        <div className="space-y-4">
          {busType === "double_decker" && (
            <div className="text-center font-medium mb-4">Segundo Piso</div>
          )}

          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4">
              {row.map((seat, seatIndex) =>
                seat === null ? (
                  <div
                    key={`space-${rowIndex}-${seatIndex}`}
                    className="w-10"
                  />
                ) : (
                  <Button
                    key={`seat-${rowIndex}-${seatIndex}`}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-10 h-10 p-0",
                      getTierColor(seat.tier),
                      occupiedSeats.includes(seat.number) &&
                        "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                    )}
                    data-selected={selectedSeats.includes(seat.number)}
                    onClick={() =>
                      !occupiedSeats.includes(seat.number) &&
                      onSeatSelect(seat.number)
                    }
                    disabled={occupiedSeats.includes(seat.number)}
                  >
                    {seat.number}
                  </Button>
                )
              )}
            </div>
          ))}

          {busType === "double_decker" && layout.length > 2 && (
            <div className="text-center font-medium mt-8 mb-4">Primer Piso</div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100" />
          <span className="text-sm">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100" />
          <span className="text-sm">Business</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100" />
          <span className="text-sm">Economy</span>
        </div>
      </div>
    </div>
  );
}
