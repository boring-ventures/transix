"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <Card>
        <CardHeader>
          <CardTitle>Lista de Buses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mantenimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell>{bus.plateNumber}</TableCell>
                  <TableCell>{busTypeLabels[bus.busType]}</TableCell>
                  <TableCell>{bus.totalCapacity}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        bus.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {bus.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {bus.maintenanceStatus ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        {bus.maintenanceStatus}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Sin mantenimiento
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
