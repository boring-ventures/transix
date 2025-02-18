"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SeatPosition } from "@/types/bus.types";

interface BusSeatMapProps {
  seatsLayout: string;
  selectedSeats: string[];
  onSeatSelect: (
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
  ) => void;
  seatPrices: { [k: string]: number };
  seatTiers?: Array<{ id: string; name: string; basePrice: number }>;
}

export const BusSeatMap: React.FC<BusSeatMapProps> = ({
  seatsLayout,
  selectedSeats,
  onSeatSelect,
  seatTiers,
}) => {
  const layout = JSON.parse(seatsLayout);

  const getTierColor = (tierId: string) => {
    const tier = seatTiers?.find((t) => t.id === tierId);
    const colors: Record<string, string> = {
      vip: "bg-red-100 hover:bg-red-200 border-red-200",
      ejecutivo: "bg-blue-100 hover:bg-blue-200 border-blue-200",
      economico: "bg-green-100 hover:bg-green-200 border-green-200",
      default: "bg-gray-100 hover:bg-gray-200 border-gray-200",
    };
    return colors[tier?.name.toLowerCase() || "default"];
  };

  const createSeatMatrix = (floor: typeof layout.firstFloor) => {
    const { dimensions, seats } = floor;
    const matrix: (SeatPosition | null)[][] = Array(dimensions.rows)
      .fill(null)
      .map(() => Array(dimensions.seatsPerRow).fill(null));

    seats.forEach((seat: SeatPosition) => {
      if (!seat.isEmpty) {
        matrix[seat.row][seat.column] = seat;
      }
    });

    return matrix;
  };

  const firstFloorMatrix = createSeatMatrix(layout.firstFloor);
  const secondFloorMatrix = layout.secondFloor
    ? createSeatMatrix(layout.secondFloor)
    : null;

  const isSeatAvailable = (seat: SeatPosition) => seat.status === "available";
  const isSeatOccupied = (seat: SeatPosition) => seat.status !== "available";

  const getSeatColor = (seat: SeatPosition) => {
    if (isSeatOccupied(seat)) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300";
    }
    if (selectedSeats.includes(seat.name)) {
      return "ring-2 ring-primary bg-primary/20";
    }
    return getTierColor(seat.tierId);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative bg-gray-100 rounded-lg p-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gray-300 rounded-t-full" />

        <div className="space-y-4">
          {/* Second Floor */}
          {secondFloorMatrix && (
            <>
              <div className="text-center font-medium mb-4">Segundo Piso</div>
              {secondFloorMatrix.map((row, rowIndex) => (
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
                        className={cn("w-10 h-10 p-0", getSeatColor(seat))}
                        onClick={() =>
                          isSeatAvailable(seat) &&
                          onSeatSelect(seat.name, {
                            id: seat.id,
                            tierId: seat.tierId,
                            tier: seatTiers?.find((t) => t.id === seat.tierId),
                          })
                        }
                        disabled={!isSeatAvailable(seat)}
                      >
                        {seat.name}
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
                    className={cn("w-10 h-10 p-0", getSeatColor(seat))}
                    onClick={() =>
                      isSeatAvailable(seat) &&
                      onSeatSelect(seat.name, {
                        id: seat.id,
                        tierId: seat.tierId,
                        tier: seatTiers?.find((t) => t.id === seat.tierId),
                      })
                    }
                    disabled={!isSeatAvailable(seat)}
                  >
                    {seat.name}
                  </Button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4">
        {seatTiers?.map((tier) => (
          <div key={tier.id} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded", getTierColor(tier.id))} />
            <span className="text-sm">{tier.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
