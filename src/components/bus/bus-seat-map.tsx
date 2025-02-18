"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BusType } from "@/types/bus.types";

type SeatTier = "economy" | "business" | "premium";

interface Seat {
  number: string;
  tier: SeatTier;
  isSelected?: boolean;
  isOccupied?: boolean;
}

interface SeatPosition {
  id: string;
  name: string;
  tierId: string;
  row: number;
  column: number;
  isEmpty: boolean;
  status?: string;
}

interface FloorDimensions {
  rows: number;
  seatsPerRow: number;
}

interface FloorLayout {
  dimensions: FloorDimensions;
  seats: SeatPosition[];
}

interface BusLayout {
  firstFloor: FloorLayout;
  secondFloor?: FloorLayout;
}

interface BusSeatMapProps {
  busType: BusType;
  seatsLayout: string;
  selectedSeats: string[];
  onSeatSelect: (seatNumber: string) => void;
  seatPrices: { [k: string]: number };
}

export const BusSeatMap: React.FC<BusSeatMapProps> = ({
  busType,
  seatsLayout,
  selectedSeats,
  onSeatSelect,
  seatPrices,
}) => {
  const layout: BusLayout = JSON.parse(seatsLayout);

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

  // Convert flat array of seats into a 2D matrix
  const createSeatMatrix = (floor: FloorLayout) => {
    const { dimensions, seats } = floor;
    const matrix: (SeatPosition | null)[][] = Array(dimensions.rows)
      .fill(null)
      .map(() => Array(dimensions.seatsPerRow).fill(null));

    seats.forEach((seat) => {
      if (!seat.isEmpty) {
        matrix[seat.row][seat.column] = seat;
      }
    });

    return matrix;
  };

  const firstFloorMatrix = createSeatMatrix(layout.firstFloor);
  const secondFloorMatrix = layout.secondFloor ? createSeatMatrix(layout.secondFloor) : null;

  // Helper function to check if a seat is available
  const isSeatAvailable = (seat: SeatPosition) => {
    return seat.status === 'available';
  };

  // Helper function to check if a seat is occupied
  const isSeatOccupied = (seat: SeatPosition) => {
    return seat.status !== 'available';
  };

  // Helper function to get seat price
  const getSeatPrice = (seatName: string) => {
    return seatPrices[seatName] || 0;
  };

  // Helper function to get seat color
  const getSeatColor = (seat: SeatPosition) => {
    if (isSeatOccupied(seat)) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300";
    }
    if (selectedSeats.includes(seat.name)) {
      return "ring-2 ring-primary";
    }
    if (!isSeatAvailable(seat)) {
      return "opacity-50 cursor-not-allowed";
    }
    return getTierColor(seat.tierId);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Bus shape container */}
      <div className="relative bg-gray-100 rounded-lg p-8">
        {/* Driver's area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gray-300 rounded-t-full" />

        {/* Seats container */}
        <div className="space-y-4">
          {secondFloorMatrix && (
            <>
              <div className="text-center font-medium mb-4">Segundo Piso</div>
              {secondFloorMatrix.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-4">
                  {row.map((position, seatIndex) =>
                    position === null ? (
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
                          getSeatColor(position)
                        )}
                        onClick={() => {
                          if (isSeatAvailable(position)) {
                            onSeatSelect(position.name);
                          }
                        }}
                        disabled={!isSeatAvailable(position)}
                      >
                        {position.name}
                      </Button>
                    )
                  )}
                </div>
              ))}
            </>
          )}

          {/* First Floor */}
          {secondFloorMatrix && (
            <div className="text-center font-medium mt-8 mb-4">Primer Piso</div>
          )}
          {firstFloorMatrix.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4">
              {row.map((position, seatIndex) =>
                position === null ? (
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
                      getSeatColor(position)
                    )}
                    onClick={() => {
                      if (isSeatAvailable(position)) {
                        onSeatSelect(position.name);
                      }
                    }}
                    disabled={!isSeatAvailable(position)}
                  >
                    {position.name}
                  </Button>
                )
              )}
            </div>
          ))}
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
};
