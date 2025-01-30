import { SeatTemplateMatrix, SeatTier } from "@/types/bus.types";

const TIER_COLORS = [
  {
    bg: "bg-purple-200",
    border: "border-purple-300",
  },
  {
    bg: "bg-blue-200",
    border: "border-blue-300",
  },
  {
    bg: "bg-green-200",
    border: "border-green-300",
  },
  {
    bg: "bg-yellow-200",
    border: "border-yellow-300",
  },
  {
    bg: "bg-pink-200",
    border: "border-pink-300",
  },
];

interface SeatMatrixPreviewProps {
  matrix: SeatTemplateMatrix;
  seatTiers: SeatTier[];
  className?: string;
  floor?: 1 | 2;
}

export const SeatMatrixPreview = ({
  matrix,
  seatTiers,
  className = "",
  floor,
}: SeatMatrixPreviewProps) => {
  const renderFloor = (floorKey: "firstFloor" | "secondFloor") => {
    const floorData = matrix[floorKey];
    if (!floorData) return null;

    const rows = [];
    for (let i = 0; i < floorData.dimensions.rows; i++) {
      rows.push(floorData.seats.filter((seat) => seat.row === i));
    }

    return (
      <div className="grid gap-[2px]">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-[2px]">
            {row.map((seat) => {
              const tierIndex = seat.tierId
                ? seatTiers?.findIndex((t) => t.id === seat.tierId)
                : -1;
              const colorClasses =
                tierIndex >= 0
                  ? TIER_COLORS[tierIndex % TIER_COLORS.length]
                  : { bg: "bg-gray-100", border: "border-gray-200" };

              return (
                <div
                  key={seat.id}
                  className={`relative w-5 h-5 border rounded-sm ${colorClasses.bg} ${colorClasses.border} group`}
                  title={
                    seatTiers.find((t) => t.id === seat.tierId)?.name ||
                    "Sin nivel"
                  }
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-muted-foreground">
                    {seat.name}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex gap-4 items-center ${className}`}>
      {(!floor || floor === 1) && renderFloor("firstFloor")}
      {matrix.secondFloor && (!floor || floor === 2) && (
        <>
          {!floor && (
            <div className="border-l border-dashed border-gray-200 h-full" />
          )}
          {renderFloor("secondFloor")}
        </>
      )}
    </div>
  );
};
