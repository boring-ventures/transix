import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";

interface SeatEditorProps {
  value: { firstFloor: string[][]; secondFloor?: string[][] };
  onChange: (value: {
    firstFloor: string[][];
    secondFloor?: string[][];
  }) => void;
}

export const SeatEditor = ({ value, onChange }: SeatEditorProps) => {
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

  const generateFloor = useCallback((rows: number, seatsPerRow: number) => {
    return Array(rows)
      .fill(null)
      .map((_, rowIndex) =>
        Array(seatsPerRow)
          .fill(null)
          .map(
            (_, seatIndex) =>
              `${rowIndex + 1}${String.fromCharCode(65 + seatIndex)}`
          )
      );
  }, []);

  const updateMatrix = useCallback(() => {
    const newMatrix = {
      firstFloor: generateFloor(
        firstFloorConfig.rows,
        firstFloorConfig.seatsPerRow
      ),
      ...(hasSecondFloor
        ? {
            secondFloor: generateFloor(
              secondFloorConfig.rows,
              secondFloorConfig.seatsPerRow
            ),
          }
        : {}),
    };
    onChange(newMatrix);
  }, [
    firstFloorConfig,
    secondFloorConfig,
    hasSecondFloor,
    generateFloor,
    onChange,
  ]);

  // Initial setup
  useEffect(() => {
    updateMatrix();
  }, []); // Run only once on mount

  const handleFirstFloorChange = (
    field: "rows" | "seatsPerRow",
    value: number
  ) => {
    setFirstFloorConfig((prev) => {
      const newConfig = { ...prev, [field]: value };
      setTimeout(() => {
        const newMatrix = {
          firstFloor: generateFloor(newConfig.rows, newConfig.seatsPerRow),
          ...(hasSecondFloor
            ? {
                secondFloor: generateFloor(
                  secondFloorConfig.rows,
                  secondFloorConfig.seatsPerRow
                ),
              }
            : {}),
        };
        onChange(newMatrix);
      }, 0);
      return newConfig;
    });
  };

  const handleSecondFloorChange = (
    field: "rows" | "seatsPerRow",
    value: number
  ) => {
    setSecondFloorConfig((prev) => {
      const newConfig = { ...prev, [field]: value };
      setTimeout(() => {
        const newMatrix = {
          firstFloor: generateFloor(
            firstFloorConfig.rows,
            firstFloorConfig.seatsPerRow
          ),
          secondFloor: generateFloor(newConfig.rows, newConfig.seatsPerRow),
        };
        onChange(newMatrix);
      }, 0);
      return newConfig;
    });
  };

  const handleSecondFloorToggle = (checked: boolean) => {
    setHasSecondFloor(checked);
    setTimeout(() => {
      const newMatrix = {
        firstFloor: generateFloor(
          firstFloorConfig.rows,
          firstFloorConfig.seatsPerRow
        ),
        ...(checked
          ? {
              secondFloor: generateFloor(
                secondFloorConfig.rows,
                secondFloorConfig.seatsPerRow
              ),
            }
          : {}),
      };
      onChange(newMatrix);
    }, 0);
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
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasSecondFloor}
              onChange={(e) => handleSecondFloorToggle(e.target.checked)}
            />
            <FormLabel>Incluir segundo piso</FormLabel>
          </div>
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
                    className="w-8 h-8 border rounded flex items-center justify-center text-xs"
                  >
                    {seat}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
