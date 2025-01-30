import { SeatTemplateMatrix, SeatTier } from "@/types/bus.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TIER_COLORS = {
  default: [
    {
      bg: "bg-red-100",
      border: "border-red-200",
    },
    {
      bg: "bg-red-200",
      border: "border-red-300",
    },
    {
      bg: "bg-gray-100",
      border: "border-gray-200",
    },
    {
      bg: "bg-gray-200",
      border: "border-gray-300",
    },
    {
      bg: "bg-red-50",
      border: "border-red-100",
    },
  ],
  intense: [
    {
      bg: "bg-red-200",
      border: "border-red-300",
    },
    {
      bg: "bg-red-300",
      border: "border-red-400",
    },
    {
      bg: "bg-gray-200",
      border: "border-gray-300",
    },
    {
      bg: "bg-gray-300",
      border: "border-gray-400",
    },
    {
      bg: "bg-red-100",
      border: "border-red-200",
    },
  ],
};

interface SeatMatrixPreviewProps {
  matrix: SeatTemplateMatrix;
  seatTiers: SeatTier[];
  className?: string;
  floor?: 1 | 2;
  variant?: "default" | "small";
  showLabels?: boolean;
}

export const SeatMatrixPreview = ({
  matrix,
  seatTiers,
  className = "",
  floor,
  variant = "default",
  showLabels = true,
}: SeatMatrixPreviewProps) => {
  const renderFloor = (floorKey: "firstFloor" | "secondFloor") => {
    const floorData = matrix[floorKey];
    if (!floorData) return null;

    const rows = [];
    for (let i = 0; i < floorData.dimensions.rows; i++) {
      rows.push(floorData.seats.filter((seat) => seat.row === i));
    }

    const sizeClasses = {
      default: "w-8 h-8 gap-[2px]",
      small: "w-3 h-3 gap-[1px]",
    };

    const labelSizes = {
      default: "text-[10px]",
      small: "text-[6px]",
    };

    return (
      <div
        className={cn(
          "grid",
          variant === "default" ? "gap-[3px]" : "gap-[1px]"
        )}
      >
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={cn(
              "flex",
              variant === "default" ? "gap-[2px]" : "gap-[1px]"
            )}
          >
            {row.map((seat) => {
              const tierIndex = seat.tierId
                ? seatTiers?.findIndex((t) => t.id === seat.tierId)
                : -1;
              const colorClasses =
                tierIndex >= 0
                  ? TIER_COLORS[variant === "default" ? "default" : "intense"][
                      tierIndex % TIER_COLORS.default.length
                    ]
                  : { bg: "bg-gray-100", border: "border-gray-200" };

              const seatTier = seatTiers.find((t) => t.id === seat.tierId);

              return (
                <TooltipProvider key={seat.id}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative border rounded-sm group cursor-default transition-colors duration-200",
                          sizeClasses[variant],
                          colorClasses.bg,
                          colorClasses.border,
                          variant === "default" && "hover:border-primary"
                        )}
                      >
                        {variant === "default" && showLabels && (
                          <span
                            className={cn(
                              "absolute inset-0 flex items-center justify-center font-medium text-muted-foreground",
                              labelSizes[variant]
                            )}
                          >
                            {seat.name}
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="text-xs bg-gray-200 border-red-500"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          Asiento {seat.name}
                        </p>
                        {seatTier ? (
                          <>
                            <p className="text-gray-700">
                              Tipo de asiento: {seatTier.name}
                            </p>
                            <p className="text-gray-700">
                              Precio: $
                              {parseFloat(seatTier.basePrice).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-700">
                            Sin tipo de asiento asignado
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center overflow-auto p-2",
        variant === "default" ? "gap-4" : "gap-2",
        className
      )}
    >
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
