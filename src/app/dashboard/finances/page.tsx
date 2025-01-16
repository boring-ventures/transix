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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction, KPI, TransactionFilters } from "@/types/finance.types";

export default function Finance() {
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: "",
    endDate: "",
    searchTerm: "",
  });

  // Mock data
  const kpis: KPI[] = [
    {
      label: "Ingresos Totales",
      value: "Bs. 10,000",
      previousValue: "Bs. 8,000",
      change: 25,
    },
    {
      label: "Tickets Vendidos",
      value: 500,
      previousValue: 450,
      change: 11.11,
    },
    {
      label: "Precio Promedio",
      value: "Bs. 20",
      previousValue: "Bs. 18",
      change: 11.11,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      date: "2024-01-01",
      description: "Venta de Ticket #TK001",
      amount: 20,
      type: "ticket",
      referenceId: "TK001",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      date: "2024-01-02",
      description: "Encomienda #PCL001",
      amount: 15,
      type: "parcel",
      referenceId: "PCL001",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      date: "2024-01-03",
      description: "Venta de Ticket #TK002",
      amount: 25,
      type: "ticket",
      referenceId: "TK002",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description
      .toLowerCase()
      .includes(filters.searchTerm?.toLowerCase() || "")
  );

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finanzas</h1>
          <p className="text-muted-foreground">
            Gestión de ingresos y transacciones
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change && (
                <p
                  className={`text-sm ${
                    kpi.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {kpi.change >= 0 ? "+" : ""}
                  {kpi.change}% vs. mes anterior
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              placeholder="Fecha Inicial"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              placeholder="Fecha Final"
            />
            <Input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              placeholder="Buscar transacciones..."
            />
            <Button>Filtrar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === "ticket"
                          ? "bg-blue-100 text-blue-800"
                          : transaction.type === "parcel"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {transaction.type === "ticket"
                        ? "Ticket"
                        : transaction.type === "parcel"
                        ? "Encomienda"
                        : "Otro"}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.referenceId}</TableCell>
                  <TableCell>Bs. {transaction.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
