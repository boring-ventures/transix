"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Parcel, CreateParcelInput } from "@/types/parcel.types";
import { parcelStatusEnum } from "@/db/schema";

export default function Parcels() {
  const [parcels, setParcels] = useState<Parcel[]>([
    {
      id: "1",
      trackingNumber: "TRX-001",
      sender: "Juan Pérez",
      recipient: "María García",
      fromCity: "La Paz",
      toCity: "Santa Cruz",
      weight: 2.5,
      price: 50,
      status: "en_transito",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      trackingNumber: "TRX-002",
      sender: "Carlos López",
      recipient: "Ana Torres",
      fromCity: "Cochabamba",
      toCity: "Sucre",
      weight: 1.8,
      price: 35,
      status: "entregado",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [newParcel, setNewParcel] = useState<CreateParcelInput>({
    sender: "",
    recipient: "",
    fromCity: "",
    toCity: "",
    weight: 0,
    price: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParcel((prev) => ({
      ...prev,
      [name]: name === "weight" || name === "price" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParcels((prev) => [
      ...prev,
      {
        id: (prev.length + 1).toString(),
        trackingNumber: `TRX-${(prev.length + 1).toString().padStart(3, "0")}`,
        ...newParcel,
        status: "pendiente",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    setNewParcel({
      sender: "",
      recipient: "",
      fromCity: "",
      toCity: "",
      weight: 0,
      price: 0,
    });
  };

  const getStatusColor = (
    status: (typeof parcelStatusEnum.enumValues)[number]
  ) => {
    switch (status) {
      case "entregado":
        return "bg-green-100 text-green-800";
      case "en_transito":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getStatusText = (
    status: (typeof parcelStatusEnum.enumValues)[number]
  ) => {
    switch (status) {
      case "entregado":
        return "Entregado";
      case "en_transito":
        return "En Tránsito";
      case "pendiente":
        return "Pendiente";
      case "cancelado":
        return "Cancelado";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Encomiendas</h1>
          <p className="text-muted-foreground">Gestión de envíos y paquetes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Encomiendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parcels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parcels.filter((p) => p.status === "en_transito").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Entregadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parcels.filter((p) => p.status === "entregado").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Encomienda</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sender">Remitente</Label>
                <Input
                  id="sender"
                  name="sender"
                  value={newParcel.sender}
                  onChange={handleInputChange}
                  placeholder="Nombre del remitente"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatario</Label>
                <Input
                  id="recipient"
                  name="recipient"
                  value={newParcel.recipient}
                  onChange={handleInputChange}
                  placeholder="Nombre del destinatario"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromCity">Ciudad de Origen</Label>
                <Input
                  id="fromCity"
                  name="fromCity"
                  value={newParcel.fromCity}
                  onChange={handleInputChange}
                  placeholder="Ciudad de origen"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toCity">Ciudad de Destino</Label>
                <Input
                  id="toCity"
                  name="toCity"
                  value={newParcel.toCity}
                  onChange={handleInputChange}
                  placeholder="Ciudad de destino"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={newParcel.weight || ""}
                  onChange={handleInputChange}
                  placeholder="Peso en kilogramos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio (Bs.)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.1"
                  value={newParcel.price || ""}
                  onChange={handleInputChange}
                  placeholder="Precio en bolivianos"
                  required
                />
              </div>
            </div>
            <Button type="submit">Registrar Encomienda</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encomiendas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking</TableHead>
                <TableHead>Remitente</TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parcels.map((parcel) => (
                <TableRow key={parcel.id}>
                  <TableCell>{parcel.trackingNumber}</TableCell>
                  <TableCell>{parcel.sender}</TableCell>
                  <TableCell>{parcel.recipient}</TableCell>
                  <TableCell>{parcel.fromCity}</TableCell>
                  <TableCell>{parcel.toCity}</TableCell>
                  <TableCell>{parcel.weight.toFixed(2)} kg</TableCell>
                  <TableCell>Bs. {parcel.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        parcel.status
                      )}`}
                    >
                      {getStatusText(parcel.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) => {
                        setParcels((prev) =>
                          prev.map((p) =>
                            p.id === parcel.id
                              ? {
                                  ...p,
                                  status:
                                    value as (typeof parcelStatusEnum.enumValues)[number],
                                }
                              : p
                          )
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Actualizar Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en_transito">En Tránsito</SelectItem>
                        <SelectItem value="entregado">Entregado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
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
