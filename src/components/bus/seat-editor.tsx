import { useState, useCallback, useEffect } from "react";
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
  seatTierAssignments?: Record<string, string>;
  selectedTierIds: {
    firstFloor: string | null;
    secondFloor: string | null;
  };
  onTierSelect: (floor: "firstFloor" | "secondFloor", tierId: string) => void;
  seatTiers: SeatTier[];
}

export const SeatEditor = ({
  value,
  onChange,
  onSeatClick,
  seatTierAssignments = {},
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

  const generateFloor = useCallback(() => {
    return Array(firstFloorConfig.rows)
      .fill(null)
      .map((_, rowIndex) =>
        Array(firstFloorConfig.seatsPerRow)
          .fill(null)
          .map(
            (_, seatIndex) =>
              `${rowIndex + 1}${String.fromCharCode(65 + seatIndex)}`
          )
      );
  }, [firstFloorConfig.rows, firstFloorConfig.seatsPerRow]);

  // Initial setup - only runs once
  useEffect(() => {
    const initialFirstFloorConfig = {
      rows: 4,
      seatsPerRow: 4,
    };

    setFirstFloorConfig(initialFirstFloorConfig);
    setSecondFloorConfig({
      rows: 4,
      seatsPerRow: 4,
    });

    if (value.firstFloor.length === 0) {
      generateFloor();
    }
  }, [value.firstFloor.length, generateFloor, onChange]);

  // Handle value changes
  useEffect(() => {
    const newFirstFloorConfig = {
      rows: value.firstFloor.length,
      seatsPerRow: value.firstFloor[0]?.length || 4,
    };

    const newSecondFloorConfig = value.secondFloor
      ? {
          rows: value.secondFloor.length,
          seatsPerRow: value.secondFloor[0]?.length || 4,
        }
      : {
          rows: 4,
          seatsPerRow: 4,
        };

    // Only update if the values are different to prevent infinite loops
    if (
      newFirstFloorConfig.rows !== firstFloorConfig.rows ||
      newFirstFloorConfig.seatsPerRow !== firstFloorConfig.seatsPerRow
    ) {
      setFirstFloorConfig(newFirstFloorConfig);
    }

    if (value.secondFloor) {
      if (
        newSecondFloorConfig.rows !== secondFloorConfig.rows ||
        newSecondFloorConfig.seatsPerRow !== secondFloorConfig.seatsPerRow
      ) {
        setSecondFloorConfig(newSecondFloorConfig);
      }
      setHasSecondFloor(true);
    }
  }, [value, firstFloorConfig, secondFloorConfig]); // Add necessary dependencies

  const handleFirstFloorChange = (
    field: "rows" | "seatsPerRow",
    value: number
  ) => {
    setFirstFloorConfig((prev) => {
      const newConfig = { ...prev, [field]: value };
      const newMatrix = {
        firstFloor: generateFloor(),
        ...(hasSecondFloor
          ? {
              secondFloor: generateFloor(),
            }
          : {}),
      };
      onChange(newMatrix);
      return newConfig;
    });
  };

  const handleSecondFloorChange = (
    field: "rows" | "seatsPerRow",
    value: number
  ) => {
    setSecondFloorConfig((prev) => {
      const newConfig = { ...prev, [field]: value };
      const newMatrix = {
        firstFloor: generateFloor(),
        secondFloor: generateFloor(),
      };
      onChange(newMatrix);
      return newConfig;
    });
  };

  const handleSecondFloorToggle = (checked: boolean) => {
    setHasSecondFloor(checked);
    const newMatrix = {
      firstFloor: generateFloor(),
      ...(checked
        ? {
            secondFloor: generateFloor(),
          }
        : {}),
    };
    onChange(newMatrix);
  };

  const getSeatTierColor = (seatId: string) => {
    const tierId = seatTierAssignments[seatId];
    if (!tierId) return "";

    const tier = seatTiers?.find((t) => t.id === tierId);
    if (!tier) return "";

    const colors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100",
      "bg-purple-100",
      "bg-pink-100",
    ];
    const index = seatTiers?.findIndex((t) => t.id === tierId) || 0;
    return colors[index % colors.length];
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
            {(activeFloor === "first"
              ? value.firstFloor
              : value.secondFloor
            )?.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2">
                {row.map((seat, seatIndex) => (
                  <div
                    key={seatIndex}
                    className={`w-8 h-8 border rounded flex items-center justify-center text-xs cursor-pointer hover:bg-gray-50 ${getSeatTierColor(
                      seat
                    )}`}
                    onClick={() =>
                      onSeatClick?.(
                        seat,
                        activeFloor === "first" ? "firstFloor" : "secondFloor"
                      )
                    }
                  >
                    {seat}
                  </div>
                ))}
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
