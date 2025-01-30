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
import { SeatTier, SeatTemplateMatrix, SeatPosition } from "@/types/bus.types";

interface SeatEditorProps {
  value: SeatTemplateMatrix;
  onChange: (value: SeatTemplateMatrix) => void;
  onSeatClick?: (seatId: string, floor: "firstFloor" | "secondFloor") => void;
  selectedTierIds: {
    firstFloor: string | null;
    secondFloor: string | null;
  };
  onTierSelect: (floor: "firstFloor" | "secondFloor", tierId: string) => void;
  seatTiers: SeatTier[];
  onSecondFloorToggle: (checked: boolean) => void;
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
  selectedTierIds,
  onTierSelect,
  seatTiers,
  onSecondFloorToggle,
}: SeatEditorProps) => {
  const [firstFloorConfig, setFirstFloorConfig] = useState({
    rows: value.firstFloor.dimensions.rows,
    seatsPerRow: value.firstFloor.dimensions.seatsPerRow,
  });
  const [secondFloorConfig, setSecondFloorConfig] = useState({
    rows: value.secondFloor?.dimensions.rows || 4,
    seatsPerRow: value.secondFloor?.dimensions.seatsPerRow || 4,
  });
  const [activeFloor, setActiveFloor] = useState<"first" | "second">("first");

  // Derive hasSecondFloor from value prop
  const hasSecondFloor = !!value.secondFloor;

  const generateSeats = useCallback(
    (config: { rows: number; seatsPerRow: number }): SeatPosition[] => {
      const seats: SeatPosition[] = [];
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.seatsPerRow; col++) {
          const name = `${row + 1}${String.fromCharCode(65 + col)}`;
          seats.push({
            id: name,
            name,
            row,
            column: col,
          });
        }
      }
      return seats;
    },
    []
  );

  const handleFirstFloorChange = useCallback(
    (field: "rows" | "seatsPerRow", newValue: number) => {
      const newConfig = { ...firstFloorConfig, [field]: newValue };
      setFirstFloorConfig(newConfig);

      const newMatrix: SeatTemplateMatrix = {
        firstFloor: {
          dimensions: newConfig,
          seats: generateSeats(newConfig),
        },
        ...(hasSecondFloor && value.secondFloor
          ? { secondFloor: value.secondFloor }
          : {}),
      };
      onChange(newMatrix);
    },
    [
      firstFloorConfig,
      hasSecondFloor,
      value.secondFloor,
      generateSeats,
      onChange,
    ]
  );

  const handleSecondFloorChange = useCallback(
    (field: "rows" | "seatsPerRow", newValue: number) => {
      const newConfig = { ...secondFloorConfig, [field]: newValue };
      setSecondFloorConfig(newConfig);

      const newMatrix: SeatTemplateMatrix = {
        firstFloor: value.firstFloor,
        secondFloor: {
          dimensions: newConfig,
          seats: generateSeats(newConfig),
        },
      };
      onChange(newMatrix);
    },
    [secondFloorConfig, value.firstFloor, generateSeats, onChange]
  );

  const renderSeats = (floor: "firstFloor" | "secondFloor") => {
    const floorData = value[floor];
    if (!floorData) return null;

    const rows: SeatPosition[][] = [];
    for (let i = 0; i < floorData.dimensions.rows; i++) {
      rows.push(floorData.seats.filter((seat) => seat.row === i));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="flex gap-2">
        {row.map((seat) => {
          const tierIndex = seat.tierId
            ? seatTiers?.findIndex((t) => t.id === seat.tierId)
            : -1;
          const colorClasses =
            tierIndex >= 0
              ? TIER_COLORS[tierIndex % TIER_COLORS.length]
              : { bg: "hover:bg-gray-50", border: "" };

          return (
            <div
              key={seat.id}
              className={`w-8 h-8 border rounded flex items-center justify-center text-xs cursor-pointer ${colorClasses.bg} ${colorClasses.border}`}
              onClick={() => onSeatClick?.(seat.id, floor)}
            >
              {seat.name}
            </div>
          );
        })}
      </div>
    ));
  };

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
            {renderSeats(
              activeFloor === "first" ? "firstFloor" : "secondFloor"
            )}
          </div>
        </div>

        <FormItem>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSecondFloor}
              onChange={(e) => onSecondFloorToggle(e.target.checked)}
            />
            <FormLabel>Incluir segundo piso</FormLabel>
          </div>
        </FormItem>
      </div>
    </div>
  );
};
