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
}

export const SeatMatrixPreview = ({
  matrix,
  seatTiers,
  className = "",
}: SeatMatrixPreviewProps) => {
  const renderFloor = (floor: "firstFloor" | "secondFloor") => {
    const floorData = matrix[floor];
    if (!floorData) return null;

    const rows = [];
    for (let i = 0; i < floorData.dimensions.rows; i++) {
      rows.push(floorData.seats.filter((seat) => seat.row === i));
    }

    return (
      <div className="grid gap-[1px]">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-[1px]">
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
                  className={`w-2 h-2 border rounded-none ${colorClasses.bg} ${colorClasses.border}`}
                  title={
                    seatTiers.find((t) => t.id === seat.tierId)?.name ||
                    "Sin nivel"
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex gap-2 items-start ${className}`}>
      {renderFloor("firstFloor")}
      {matrix.secondFloor && (
        <>
          <div className="border-l border-dashed border-gray-200 h-full" />
          {renderFloor("secondFloor")}
        </>
      )}
    </div>
  );
};
