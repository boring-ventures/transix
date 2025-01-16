"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bus, CreateBusInput, BusTypeLabel } from "@/types/bus.types";
import { busTypeEnum } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export default function BusManagement() {
  const [buses, setBuses] = useState<Bus[]>([
    {
      id: "1",
      companyId: "1",
      plateNumber: "ABC-123",
      busType: "luxury",
      totalCapacity: 40,
      isActive: true,
      maintenanceStatus: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      companyId: "1",
      plateNumber: "XYZ-789",
      busType: "double_decker",
      totalCapacity: 80,
      isActive: true,
      maintenanceStatus: "Mantenimiento programado",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [newBus, setNewBus] = useState<CreateBusInput>({
    companyId: "1",
    plateNumber: "",
    busType: "standard",
    totalCapacity: 40,
    maintenanceStatus: null,
  });

  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBuses((prev) => [
      ...prev,
      {
        ...newBus,
        id: uuidv4(),
        isActive: true,
        maintenanceStatus: newBus.maintenanceStatus || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    setNewBus({
      companyId: "1",
      plateNumber: "",
      busType: "standard",
      totalCapacity: 40,
      maintenanceStatus: null,
    });
    toast({
      title: "Bus agregado",
      description: "El nuevo bus ha sido registrado exitosamente.",
    });
  };

  const busTypeLabels: BusTypeLabel = {
    standard: "Estándar",
    double_decker: "Dos Pisos",
    luxury: "Lujo",
    mini: "Mini Bus",
  };

  const columns: Column<Bus>[] = [
    {
      id: "plateNumber",
      accessorKey: "plateNumber",
      header: "Placa",
      sortable: true,
    },
    {
      id: "busType",
      accessorKey: "busType",
      header: "Tipo",
      cell: ({ row }) => busTypeLabels[row.busType],
      sortable: true,
    },
    {
      id: "totalCapacity",
      accessorKey: "totalCapacity",
      header: "Capacidad",
      sortable: true,
    },
    {
      id: "status",
      accessorKey: "isActive",
      header: "Estado",
      sortable: true,
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
    {
      id: "maintenance",
      accessorKey: "maintenanceStatus",
      header: "Mantenimiento",
      sortable: true,
      cell: ({ row }) =>
        row.maintenanceStatus ? (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            {row.maintenanceStatus}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">
            Sin mantenimiento
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Buses</h1>
          <p className="text-muted-foreground">Administre su flota de buses</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>Agregar Bus</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Bus</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Número de Placa</Label>
                <Input
                  id="plateNumber"
                  value={newBus.plateNumber}
                  onChange={(e) =>
                    setNewBus((prev) => ({
                      ...prev,
                      plateNumber: e.target.value,
                    }))
                  }
                  placeholder="Ingrese la placa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="busType">Tipo de Bus</Label>
                <Select
                  value={newBus.busType}
                  onValueChange={(
                    value: (typeof busTypeEnum.enumValues)[number]
                  ) => setNewBus((prev) => ({ ...prev, busType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {busTypeEnum.enumValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {busTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalCapacity">Capacidad Total</Label>
                <Input
                  id="totalCapacity"
                  type="number"
                  value={newBus.totalCapacity}
                  onChange={(e) =>
                    setNewBus((prev) => ({
                      ...prev,
                      totalCapacity: parseInt(e.target.value),
                    }))
                  }
                  placeholder="Ingrese la capacidad"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Guardar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Buses Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buses.filter((bus) => bus.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              En Mantenimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {buses.filter((bus) => bus.maintenanceStatus !== null).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Lista de Buses"
        data={buses}
        columns={columns}
        searchable={true}
        searchField="plateNumber"
        onAdd={() =>
          document
            .querySelector<HTMLButtonElement>('button[type="submit"]')
            ?.click()
        }
      />
    </div>
  );
}
