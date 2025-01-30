"use client";

import { useState } from "react";
import { useCompanies } from "@/hooks/useCompanies";
import { DataTable } from "@/components/table/data-table";
import { Column } from "@/components/table/types";
import { BusTypeTemplate, SeatTemplateMatrix } from "@/types/bus.types";
import { LoadingTable } from "@/components/table/loading-table";
import { useBusTemplates, useDeleteBusTemplate } from "@/hooks/useBusTemplates";
import { useSeatTiers } from "@/hooks/useSeatTiers";
import { CreateTemplateModal } from "@/components/bus/create-template-modal";
import { ViewTemplateModal } from "@/components/bus/view-template-modal";
import { SeatMatrixPreview } from "@/components/bus/seat-matrix-preview";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BusTemplatesPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: templates, isLoading: templatesLoading } = useBusTemplates();
  const { data: seatTiers } = useSeatTiers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] =
    useState<BusTypeTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const deleteTemplate = useDeleteBusTemplate();
  const { toast } = useToast();

  const handleView = (template: BusTypeTemplate) => {
    setViewingTemplate(template);
    setIsViewOpen(true);
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate.mutateAsync(templateToDelete);
      toast({
        title: "Plantilla desactivada",
        description: "La plantilla ha sido desactivada exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al desactivar la plantilla",
        variant: "destructive",
      });
    } finally {
      setTemplateToDelete(null);
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as BusTypeTemplate;
        return (
          <span className="font-mono text-[10px] text-muted-foreground truncate w-20 inline-block">
            {data.id.slice(0, 8)}...
          </span>
        );
      },
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Nombre",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as BusTypeTemplate;
        return <div className="font-medium min-w-[200px]">{data.name}</div>;
      },
    },
    {
      id: "description",
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => {
        const data = row as unknown as BusTypeTemplate;
        return (
          data.description || (
            <span className="text-gray-400 italic">Sin descripción</span>
          )
        );
      },
    },
    {
      id: "preview",
      accessorKey: "seatTemplateMatrix",
      header: "Vista Previa",
      cell: ({ row }) => {
        const data = row as unknown as BusTypeTemplate;
        return (
          <div className="min-w-[100px]">
            <SeatMatrixPreview
              matrix={data.seatTemplateMatrix as SeatTemplateMatrix}
              seatTiers={seatTiers || []}
              variant="small"
              showLabels={false}
            />
          </div>
        );
      },
    },
    {
      id: "totalCapacity",
      accessorKey: "totalCapacity",
      header: "Capacidad",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as BusTypeTemplate;
        return (
          <span className="font-medium">{data.totalCapacity} asientos</span>
        );
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Fecha de Creación",
      sortable: true,
      cell: ({ row }) => {
        const data = row as unknown as BusTypeTemplate;
        return data.createdAt
          ? new Date(data.createdAt).toLocaleDateString()
          : "N/A";
      },
    },
    {
      id: "actions",
      accessorKey: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const data = row as unknown as BusTypeTemplate;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(data)}
              title="Ver plantilla"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTemplateToDelete(data.id)}
              title="Desactivar plantilla"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (companiesLoading || templatesLoading) {
    return <LoadingTable columnCount={6} rowCount={10} />;
  }

  return (
    <div className="space-y-6">
      <CreateTemplateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        companies={companies || []}
      />

      {viewingTemplate && (
        <ViewTemplateModal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setViewingTemplate(null);
          }}
          template={viewingTemplate}
          companies={companies || []}
        />
      )}

      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={() => setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la plantilla. Las plantillas desactivadas
              no podrán ser utilizadas para crear nuevos buses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
