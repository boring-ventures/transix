"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { Parcel, CreateParcelInput } from "@/types/parcel.types";

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
      status: "in_transit",
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
      status: "delivered",
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
        status: "received",
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

  const getStatusColor = (status: Parcel["status"]) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "received":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "ready_for_pickup":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Parcel["status"]) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "in_transit":
        return "En Tránsito";
      case "received":
        return "Recibido";
      case "cancelled":
        return "Cancelado";
      case "ready_for_pickup":
        return "Listo para Recoger";
      default:
        return status;
    }
  };

  const columns: Column<Parcel>[] = [
    {
      id: "trackingNumber",
      accessorKey: "trackingNumber",
      header: "Tracking",
      sortable: true,
    },
    {
      id: "sender",
      accessorKey: "sender",
      header: "Remitente",
      sortable: true,
    },
    {
      id: "recipient",
      accessorKey: "recipient",
      header: "Destinatario",
      sortable: true,
    },
    {
      id: "fromCity",
      accessorKey: "fromCity",
      header: "Origen",
      sortable: true,
    },
    {
      id: "toCity",
      accessorKey: "toCity",
      header: "Destino",
      sortable: true,
    },
    {
      id: "weight",
      accessorKey: "weight",
      header: "Peso",
      cell: ({ row }) => `${row.weight.toFixed(2)} kg`,
      sortable: true,
    },
    {
      id: "price",
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => `Bs. ${row.price.toFixed(2)}`,
      sortable: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Estado",
      sortable: true,
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
            row.status
          )}`}
        >
          {getStatusText(row.status)}
        </span>
      ),
    },
  ];

  const handleUpdateStatus = (parcel: Parcel) => {
    setParcels((prev) =>
      prev.map((p) =>
        p.id === parcel.id
          ? {
              ...p,
              status: getNextStatus(p.status),
            }
          : p
      )
    );
  };

  const getNextStatus = (currentStatus: Parcel["status"]): Parcel["status"] => {
    switch (currentStatus) {
      case "received":
        return "in_transit";
      case "in_transit":
        return "ready_for_pickup";
      case "ready_for_pickup":
        return "delivered";
      case "delivered":
        return "delivered"; // Terminal state
      case "cancelled":
        return "cancelled"; // Terminal state
      default:
        return "received";
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
              {parcels.filter((p) => p.status === "in_transit").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Entregadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parcels.filter((p) => p.status === "delivered").length}
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

      <DataTable
        title="Encomiendas Registradas"
        data={parcels}
        columns={columns}
        searchable={true}
        searchField="trackingNumber"
        onEdit={handleUpdateStatus}
      />
    </div>
  );
}
