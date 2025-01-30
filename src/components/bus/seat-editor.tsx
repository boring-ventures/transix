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

  const handleFirstFloorChange = useCallback(
    (field: "rows" | "seatsPerRow", newValue: number) => {
      const newConfig = { ...firstFloorConfig, [field]: newValue };
      setFirstFloorConfig(newConfig);

      // Get current matrix to preserve tier assignments
      const currentMatrix = { ...value };
      const currentSeats = currentMatrix.firstFloor.seats;

      // Generate new seats while preserving existing tier assignments
      const newSeats = [];
      for (let row = 0; row < newConfig.rows; row++) {
        for (let col = 0; col < newConfig.seatsPerRow; col++) {
          const name = `${row + 1}${String.fromCharCode(65 + col)}`;
          // Try to find existing seat with same name to preserve its tier
          const existingSeat = currentSeats.find((s) => s.name === name);
          newSeats.push({
            id: name,
            name,
            row,
            column: col,
            tierId: existingSeat?.tierId,
          });
        }
      }

      const newMatrix: SeatTemplateMatrix = {
        firstFloor: {
          dimensions: newConfig,
          seats: newSeats,
        },
        ...(hasSecondFloor && value.secondFloor
          ? { secondFloor: value.secondFloor }
          : {}),
      };
      onChange(newMatrix);
    },
    [firstFloorConfig, hasSecondFloor, value, onChange]
  );

  const handleSecondFloorChange = useCallback(
    (field: "rows" | "seatsPerRow", newValue: number) => {
      const newConfig = { ...secondFloorConfig, [field]: newValue };
      setSecondFloorConfig(newConfig);

      // Get current matrix to preserve tier assignments
      const currentMatrix = { ...value };
      const currentSeats = currentMatrix.secondFloor?.seats || [];

      // Generate new seats while preserving existing tier assignments
      const newSeats = [];
      for (let row = 0; row < newConfig.rows; row++) {
        for (let col = 0; col < newConfig.seatsPerRow; col++) {
          const name = `${row + 1}${String.fromCharCode(65 + col)}`;
          const seatId = `2${name}`;
          // Try to find existing seat with same ID to preserve its tier
          const existingSeat = currentSeats.find((s) => s.id === seatId);
          newSeats.push({
            id: seatId,
            name: `2${name}`,
            row,
            column: col,
            tierId: existingSeat?.tierId,
          });
        }
      }

      const newMatrix: SeatTemplateMatrix = {
        firstFloor: value.firstFloor,
        secondFloor: {
          dimensions: newConfig,
          seats: newSeats,
        },
      };
      onChange(newMatrix);
    },
    [secondFloorConfig, value, onChange]
  );

  const handleMarkAllSeats = useCallback(
    (floor: "firstFloor" | "secondFloor") => {
      const selectedTierId = selectedTierIds[floor];
      if (!selectedTierId) return;

      const currentMatrix = { ...value };
      const floorData = currentMatrix[floor];
      if (!floorData) return;

      const updatedSeats = floorData.seats.map((seat) => ({
        ...seat,
        tierId: selectedTierId,
      }));

      const updatedMatrix = {
        ...currentMatrix,
        [floor]: {
          ...floorData,
          seats: updatedSeats,
        },
      };

      onChange(updatedMatrix);
    },
    [value, selectedTierIds, onChange]
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

  const renderTierSelectContent = () => (
    <SelectContent>
      {seatTiers.map((tier, index) => {
        const colorClasses = TIER_COLORS[index % TIER_COLORS.length];
        return (
          <SelectItem key={tier.id} value={tier.id}>
            <div className="flex items-center space-x-2">
              <div
                className={`w-4 h-4 rounded ${colorClasses.bg} ${colorClasses.border}`}
              />
              <span>{tier.name}</span>
            </div>
          </SelectItem>
        );
      })}
    </SelectContent>
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
            <div className="flex items-center space-x-4">
              <FormItem className="flex-1">
                <FormLabel>Tipo de Asiento para Asignar</FormLabel>
                <Select
                  value={selectedTierIds.firstFloor || ""}
                  onValueChange={(value) => onTierSelect("firstFloor", value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedTierIds.firstFloor ? (
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded ${
                              TIER_COLORS[
                                seatTiers.findIndex(
                                  (t) => t.id === selectedTierIds.firstFloor
                                ) % TIER_COLORS.length
                              ].bg
                            }`}
                          />
                          <span>
                            {
                              seatTiers.find(
                                (t) => t.id === selectedTierIds.firstFloor
                              )?.name
                            }
                          </span>
                        </div>
                      ) : (
                        "Seleccionar tipo de asiento"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  {renderTierSelectContent()}
                </Select>
              </FormItem>
              {selectedTierIds.firstFloor && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleMarkAllSeats("firstFloor")}
                  className="mt-6"
                >
                  Marcar Todos
                </Button>
              )}
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
            <div className="flex items-center space-x-4">
              <FormItem className="flex-1">
                <FormLabel>Tipo de Asiento para Asignar</FormLabel>
                <Select
                  value={selectedTierIds.secondFloor || ""}
                  onValueChange={(value) => onTierSelect("secondFloor", value)}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {selectedTierIds.secondFloor ? (
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded ${
                              TIER_COLORS[
                                seatTiers.findIndex(
                                  (t) => t.id === selectedTierIds.secondFloor
                                ) % TIER_COLORS.length
                              ].bg
                            }`}
                          />
                          <span>
                            {
                              seatTiers.find(
                                (t) => t.id === selectedTierIds.secondFloor
                              )?.name
                            }
                          </span>
                        </div>
                      ) : (
                        "Seleccionar tipo de asiento"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  {renderTierSelectContent()}
                </Select>
              </FormItem>
              {selectedTierIds.secondFloor && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleMarkAllSeats("secondFloor")}
                  className="mt-6"
                >
                  Marcar Todos
                </Button>
              )}
            </div>
          </div>
        )}

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

        <div className="border rounded p-4">
          <div className="grid gap-2">
            {renderSeats(
              activeFloor === "first" ? "firstFloor" : "secondFloor"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
