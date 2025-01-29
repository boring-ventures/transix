"use client";

import { useState, useCallback, useEffect } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BusTypeTemplate,
  CreateBusTypeTemplateInput,
  createBusTypeTemplateSchema,
} from "@/types/bus.types";
import { useForm } from "react-hook-form";
import { LoadingTable } from "@/components/table/loading-table";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateBusTemplate } from "@/hooks/useBusTemplates";

// Visual Seat Editor Component
const SeatEditor = ({
  value,
  onChange,
}: {
  value: { firstFloor: string[][]; secondFloor?: string[][] };
  onChange: (value: {
    firstFloor: string[][];
    secondFloor?: string[][];
  }) => void;
}) => {
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

// Add SeatTierManager component
const SeatTierManager = ({
  value = [],
  onChange,
}: {
  value: Array<{
    name: string;
    description?: string;
    basePrice: number;
    isActive?: boolean;
  }>;
  onChange: (
    tiers: Array<{
      name: string;
      description?: string;
      basePrice: number;
      isActive?: boolean;
    }>
  ) => void;
}) => {
  const [isAddingTier, setIsAddingTier] = useState(false);
  const [newTier, setNewTier] = useState({
    name: "",
    description: "",
    basePrice: 0,
    isActive: true,
  });

  const addTier = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (newTier.name && newTier.basePrice >= 0) {
      onChange([...value, newTier]);
      setNewTier({ name: "", description: "", basePrice: 0, isActive: true });
      setIsAddingTier(false);
    }
  };

  const removeTier = (index: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Niveles de Asiento</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setIsAddingTier(true);
          }}
        >
          Agregar Nivel
        </Button>
      </div>

      {isAddingTier && (
        <div className="space-y-4 border rounded p-4">
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input
                value={newTier.name}
                onChange={(e) =>
                  setNewTier({ ...newTier, name: e.target.value })
                }
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Input
                value={newTier.description}
                onChange={(e) =>
                  setNewTier({ ...newTier, description: e.target.value })
                }
              />
            </FormControl>
          </FormItem>
          <FormItem>
            <FormLabel>Precio Base</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                value={newTier.basePrice}
                onChange={(e) =>
                  setNewTier({
                    ...newTier,
                    basePrice: parseFloat(e.target.value),
                  })
                }
              />
            </FormControl>
          </FormItem>
          <div className="flex space-x-2">
            <Button type="button" onClick={addTier}>
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setIsAddingTier(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {value.map((tier, index) => (
          <div
            key={index}
            className="border rounded p-3 flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium">{tier.name}</h4>
              {tier.description && (
                <p className="text-sm text-gray-500">{tier.description}</p>
              )}
              <p className="text-sm">
                Precio Base: ${tier.basePrice.toFixed(2)}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={(e) => removeTier(index, e)}
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function BusTemplatesPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  const createForm = useForm<CreateBusTypeTemplateInput>({
    resolver: zodResolver(createBusTypeTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: "",
      totalCapacity: 0,
      seatTemplateMatrix: {
        firstFloor: Array(4).fill(Array(4).fill("")),
      },
      seatTiers: [],
      isActive: true,
    },
  });

  const columns: Column<BusTypeTemplate>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      sortable: true,
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Descripción",
    },
    {
      id: "totalCapacity",
      accessorKey: "totalCapacity",
      header: "Capacidad Total",
      sortable: true,
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Estado",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  const calculateTotalCapacity = (seatMatrix: {
    firstFloor: string[][];
    secondFloor?: string[][];
  }) => {
    const firstFloorCapacity = seatMatrix.firstFloor.reduce(
      (acc, row) => acc + row.length,
      0
    );
    const secondFloorCapacity =
      seatMatrix.secondFloor?.reduce((acc, row) => acc + row.length, 0) || 0;
    return firstFloorCapacity + secondFloorCapacity;
  };

  const createBusTemplate = useCreateBusTemplate();

  const onCreateSubmit = async (formData: CreateBusTypeTemplateInput) => {
    try {
      await createBusTemplate.mutateAsync(formData);
      setIsCreateOpen(false);
      createForm.reset();
      toast({
        title: "Plantilla creada",
        description: "La plantilla ha sido creada exitosamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Hubo un error al crear la plantilla.",
        variant: "destructive",
      });
    }
  };

  if (companiesLoading) {
    return <LoadingTable columnCount={4} rowCount={10} />;
  }

  return (
    <div className="space-y-6">
      {/* Create Template Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Crear Plantilla de Bus</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Bus Details and Seat Tiers */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="companyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies?.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <FormField
                      control={createForm.control}
                      name="seatTiers"
                      render={({ field }) => (
                        <FormItem>
                          <SeatTierManager
                            value={field.value}
                            onChange={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Right Column - Seat Configuration */}
                <div>
                  <FormField
                    control={createForm.control}
                    name="seatTemplateMatrix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Configuración de Asientos</FormLabel>
                        <FormControl>
                          <SeatEditor
                            value={field.value}
                            onChange={(newMatrix) => {
                              field.onChange(newMatrix);
                              setTimeout(() => {
                                createForm.setValue(
                                  "totalCapacity",
                                  calculateTotalCapacity(newMatrix)
                                );
                              }, 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Crear Plantilla</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DataTable
        title="Plantillas de Bus"
        description="Gestiona las plantillas de configuración de buses."
        data={[]} // TODO: Add templates data hook
        columns={columns}
        searchable
        searchField="name"
        onAdd={() => setIsCreateOpen(true)}
      />
    </div>
  );
}
