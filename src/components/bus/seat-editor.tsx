import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeatTier } from "@/types/bus.types";

interface SeatEditorProps {
  value: { firstFloor: string[][]; secondFloor?: string[][] };
  onChange: (value: {
    firstFloor: string[][];
    secondFloor?: string[][];
  }) => void;
  onSeatClick?: (seatId: string, floor: "firstFloor" | "secondFloor") => void;
  seatTierAssignments?: {
    firstFloor: Record<string, string>;
    secondFloor: Record<string, string>;
  };
  selectedTierIds: {
    firstFloor: string | null;
    secondFloor: string | null;
  };
  onTierSelect: (floor: "firstFloor" | "secondFloor", tierId: string) => void;
  seatTiers: SeatTier[];
}

const TIER_COLORS = [
  {
    bg: "bg-purple-100 hover:bg-purple-200",
    border: "border-purple-200",
    selected: "bg-purple-500 text-white",
  },
  {
    bg: "bg-blue-100 hover:bg-blue-200",
    border: "border-blue-200",
    selected: "bg-blue-500 text-white",
  },
  {
    bg: "bg-green-100 hover:bg-green-200",
    border: "border-green-200",
    selected: "bg-green-500 text-white",
  },
  {
    bg: "bg-yellow-100 hover:bg-yellow-200",
    border: "border-yellow-200",
    selected: "bg-yellow-500 text-white",
  },
  {
    bg: "bg-pink-100 hover:bg-pink-200",
    border: "border-pink-200",
    selected: "bg-pink-500 text-white",
  },
];

export const SeatEditor = ({
  value,
  onChange,
  onSeatClick,
  seatTierAssignments = { firstFloor: {}, secondFloor: {} },
  selectedTierIds,
  onTierSelect,
  seatTiers,
}: SeatEditorProps) => {
  const [firstFloorConfig, setFirstFloorConfig] = useState({
    rows: value.firstFloor.length || 4,
    seatsPerRow: value.firstFloor[0]?.length || 4,
  });
  const [secondFloorConfig, setSecondFloorConfig] = useState({
    rows: value.secondFloor?.length || 4,
    seatsPerRow: value.secondFloor?.[0]?.length || 4,
  });
  const [hasSecondFloor, setHasSecondFloor] = useState(!!value.secondFloor);
  const [activeFloor, setActiveFloor] = useState<"first" | "second">("first");

  const generateMatrix = useCallback(
    (config: { rows: number; seatsPerRow: number }) => {
      return Array(config.rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(config.seatsPerRow)
            .fill(null)
            .map(
              (_, seatIndex) =>
                `${rowIndex + 1}${String.fromCharCode(65 + seatIndex)}`
            )
        );
    },
    []
  );

  const handleFirstFloorChange = useCallback(
    (field: "rows" | "seatsPerRow", newValue: number) => {
      const newConfig = { ...firstFloorConfig, [field]: newValue };
      setFirstFloorConfig(newConfig);

      const newMatrix = {
        firstFloor: generateMatrix(newConfig),
        ...(hasSecondFloor ? { secondFloor: value.secondFloor } : {}),
      };
      onChange(newMatrix);
    },
    [
      firstFloorConfig,
      hasSecondFloor,
      value.secondFloor,
      generateMatrix,
      onChange,
    ]
  );

  const handleSecondFloorChange = useCallback(
    (field: "rows" | "seatsPerRow", newValue: number) => {
      const newConfig = { ...secondFloorConfig, [field]: newValue };
      setSecondFloorConfig(newConfig);

      const newMatrix = {
        firstFloor: value.firstFloor,
        secondFloor: generateMatrix(newConfig),
      };
      onChange(newMatrix);
    },
    [secondFloorConfig, value.firstFloor, generateMatrix, onChange]
  );

  const handleSecondFloorToggle = useCallback(
    (checked: boolean) => {
      setHasSecondFloor(checked);

      if (checked) {
        // Copy first floor dimensions to second floor
        setSecondFloorConfig({
          rows: firstFloorConfig.rows,
          seatsPerRow: firstFloorConfig.seatsPerRow,
        });

        // Generate second floor matrix with same dimensions as first floor
        const newMatrix = {
          firstFloor: value.firstFloor,
          secondFloor: generateMatrix({
            rows: firstFloorConfig.rows,
            seatsPerRow: firstFloorConfig.seatsPerRow,
          }),
        };
        onChange(newMatrix);
      } else {
        // Remove second floor
        const newMatrix = {
          firstFloor: value.firstFloor,
        };
        onChange(newMatrix);
      }
    },
    [value.firstFloor, firstFloorConfig, generateMatrix, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Vista Previa</h4>
        {hasSecondFloor && (
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={activeFloor === "first" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFloor("first")}
            >
              Primer Piso
            </Button>
            <Button
              type="button"
              variant={activeFloor === "second" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFloor("second")}
            >
              Segundo Piso
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {activeFloor === "first" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Filas (Primer Piso)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={firstFloorConfig.rows}
                    onChange={(e) =>
                      handleFirstFloorChange("rows", parseInt(e.target.value))
                    }
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Asientos por Fila (Primer Piso)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={firstFloorConfig.seatsPerRow}
                    onChange={(e) =>
                      handleFirstFloorChange(
                        "seatsPerRow",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Filas (Segundo Piso)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={secondFloorConfig.rows}
                    onChange={(e) =>
                      handleSecondFloorChange("rows", parseInt(e.target.value))
                    }
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Asientos por Fila (Segundo Piso)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={secondFloorConfig.seatsPerRow}
                    onChange={(e) =>
                      handleSecondFloorChange(
                        "seatsPerRow",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </FormControl>
              </FormItem>
            </div>
          </div>
        )}

        <FormItem>
          <FormLabel>
            Seleccionar Nivel para Asignar (
            {activeFloor === "first" ? "Primer" : "Segundo"} Piso)
          </FormLabel>
          <Select
            value={
              selectedTierIds[
                activeFloor === "first" ? "firstFloor" : "secondFloor"
              ] || ""
            }
            onValueChange={(value) =>
              onTierSelect(
                activeFloor === "first" ? "firstFloor" : "secondFloor",
                value
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar nivel de asiento" />
            </SelectTrigger>
            <SelectContent>
              {seatTiers.map((tier) => (
                <SelectItem key={tier.id} value={tier.id}>
                  {tier.name} - $
                  {parseFloat(tier.basePrice.toString()).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <div className="border rounded p-4">
          <div className="grid gap-2">
            {(activeFloor === "first"
              ? value.firstFloor
              : value.secondFloor
            )?.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((seat, seatIndex) => {
                  const currentFloor =
                    activeFloor === "first" ? "firstFloor" : "secondFloor";
                  const tierId = seatTierAssignments[currentFloor][seat];
                  const tierIndex = tierId
                    ? seatTiers?.findIndex((t) => t.id === tierId)
                    : -1;
                  const colorClasses =
                    tierIndex >= 0
                      ? TIER_COLORS[tierIndex % TIER_COLORS.length]
                      : { bg: "hover:bg-gray-50", border: "" };

                  return (
                    <div
                      key={seatIndex}
                      className={`w-8 h-8 border rounded flex items-center justify-center text-xs cursor-pointer ${colorClasses.bg} ${colorClasses.border}`}
                      onClick={() => onSeatClick?.(seat, currentFloor)}
                    >
                      {seat}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <FormItem>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSecondFloor}
              onChange={(e) => handleSecondFloorToggle(e.target.checked)}
            />
            <FormLabel>Incluir segundo piso</FormLabel>
          </div>
        </FormItem>
      </div>
    </div>
  );
};
