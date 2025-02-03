import { SeatTemplateMatrix, SeatTier, BusSeat } from "@/types/bus.types";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define specific colors for each tier by name
const TIER_COLOR_MAP: Record<string, { bg: string; border: string }> = {
  "12312": { bg: "bg-red-100", border: "border-red-200" },
  VIP: { bg: "bg-red-200", border: "border-red-300" },
  "Tester 2": { bg: "bg-gray-100", border: "border-gray-200" },
  Regular: { bg: "bg-gray-200", border: "border-gray-300" },
  Basico: { bg: "bg-red-50", border: "border-red-100" },
};

// Fallback colors for any additional tiers
const FALLBACK_COLORS = [
  { bg: "bg-red-100", border: "border-red-200" },
  { bg: "bg-red-200", border: "border-red-300" },
  { bg: "bg-gray-100", border: "border-gray-200" },
  { bg: "bg-gray-200", border: "border-gray-300" },
  { bg: "bg-red-50", border: "border-red-100" },
];

interface SeatMatrixPreviewProps {
  matrix: SeatTemplateMatrix;
  seatTiers: SeatTier[];
  className?: string;
  floor?: 1 | 2;
  variant?: "default" | "small";
  showLabels?: boolean;
  // Bus-specific props
  mode?: "template" | "bus";
  seats?: BusSeat[];
  onSeatClick?: (seatId: string) => void;
  selectedSeatId?: string;
  selectedSeats?: string[];
}

export const SeatMatrixPreview = ({
  matrix,
  seatTiers,
  className = "",
  floor,
  variant = "default",
  showLabels = true,
  mode = "template",
  seats,
  onSeatClick,
  selectedSeatId,
  selectedSeats = [],
}: SeatMatrixPreviewProps) => {
  const getTierColor = (tierId: string | undefined) => {
    if (!tierId) return { bg: "bg-gray-100", border: "border-gray-200" };

    const tier = seatTiers.find((t) => t.id === tierId);
    if (!tier) return { bg: "bg-gray-100", border: "border-gray-200" };

    // Try to get color by tier name
    const colorByName = TIER_COLOR_MAP[tier.name];
    if (colorByName) return colorByName;

    // Fallback to index-based color
    const index = seatTiers.findIndex((t) => t.id === tier.id);
    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

  const renderFloor = (floorKey: "firstFloor" | "secondFloor") => {
    const floorData = matrix[floorKey];
    if (!floorData) return null;

    const rows = [];
    for (let i = 0; i < floorData.dimensions.rows; i++) {
      rows.push(floorData.seats.filter((seat) => seat.row === i));
    }

    const sizeClasses = {
      default: mode === "bus" ? "w-10 h-10" : "w-8 h-8",
      small: "w-3 h-3",
    };

    const labelSizes = {
      default: mode === "bus" ? "text-[12px]" : "text-[10px]",
      small: "text-[6px]",
    };

    const gapSizes = {
      default: mode === "bus" ? "gap-[3px]" : "gap-[2px]",
      small: "gap-[1px]",
    };

    return (
      <div
        className={cn("grid", variant === "small" ? "gap-[1px]" : "gap-[3px]")}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={cn("flex", gapSizes[variant])}>
            {row.map((seat) => {
              const busSeat =
                mode === "bus"
                  ? seats?.find((s) => s.seatNumber === seat.name)
                  : undefined;

              const isSelected =
                mode === "bus" &&
                (busSeat?.id === selectedSeatId ||
                  (busSeat && selectedSeats.includes(busSeat.id)));

              // Use the bus seat's tier if available, otherwise use the template's tier
              const colorClasses = getTierColor(busSeat?.tierId || seat.tierId);

              const getStatusColor = (
                status: "available" | "maintenance" | null | undefined
              ) => {
                if (!status) return `${colorClasses.bg} ${colorClasses.border}`;
                switch (status) {
                  case "maintenance":
                    return "bg-yellow-100 border-yellow-300";
                  case "available":
                    return `${colorClasses.bg} ${colorClasses.border}`;
                  default:
                    return `${colorClasses.bg} ${colorClasses.border}`;
                }
              };

              const seatTier = seatTiers.find(
                (t) => t.id === (busSeat?.tierId || seat.tierId)
              );

              return (
                <TooltipProvider key={seat.id}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative border rounded-sm group transition-colors duration-200",
                          sizeClasses[variant],
                          mode === "bus" && busSeat
                            ? getStatusColor(busSeat.status)
                            : `${colorClasses.bg} ${colorClasses.border}`,
                          variant !== "small" && "hover:bg-opacity-80",
                          isSelected && "ring-2 ring-primary",
                          mode === "bus" && "cursor-pointer hover:shadow-sm",
                          selectedSeats.length > 0 &&
                            "hover:ring-2 hover:ring-primary/50"
                        )}
                        onClick={() => {
                          if (mode === "bus" && busSeat && onSeatClick) {
                            onSeatClick(busSeat.id);
                          }
                        }}
                      >
                        {showLabels && (
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
                      className="text-xs bg-white border shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900">
                          Asiento {seat.name}
                        </p>
                        {seatTier && (
                          <>
                            <p className="text-gray-700">
                              Tipo: {seatTier.name}
                            </p>
                            <p className="text-gray-700">
                              Precio: $
                              {parseFloat(seatTier.basePrice).toFixed(2)}
                            </p>
                          </>
                        )}
                        {mode === "bus" && busSeat && (
                          <>
                            <p className="text-gray-700">
                              Estado:{" "}
                              {busSeat.status === "available"
                                ? "Disponible"
                                : "Mantenimiento"}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">
                              ID: {busSeat.id}
                            </p>
                          </>
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
        variant === "small" ? "gap-2" : "gap-4",
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
