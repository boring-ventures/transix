"use client";

import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { BusTypeTemplate } from "@/types/bus.types";
import { LoadingTable } from "@/components/table/loading-table";
import { useBusTemplates } from "@/hooks/useBusTemplates";
import { CreateTemplateModal } from "@/components/bus/create-template-modal";

export default function BusTemplatesPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: templates, isLoading: templatesLoading } = useBusTemplates();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  if (companiesLoading || templatesLoading) {
    return <LoadingTable columnCount={4} rowCount={10} />;
  }

  return (
    <div className="space-y-6">
      <CreateTemplateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        companies={companies || []}
      />

      <DataTable
        title="Plantillas de Bus"
        description="Gestiona las plantillas de configuración de buses."
        data={templates || []}
        columns={columns}
        searchable
        searchField="name"
        onAdd={() => setIsCreateOpen(true)}
      />
    </div>
  );
}
