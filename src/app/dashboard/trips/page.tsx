import { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { TripList } from "@/components/trip/trip-list";

export const metadata: Metadata = {
  title: "Lista de Viajes | Transix",
  description: "Gestión de viajes y liquidaciones",
};

export default function TripsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Lista de Viajes"
        description="Gestiona los viajes programados y sus liquidaciones"
      />
      <TripList />
    </div>
  );
} 