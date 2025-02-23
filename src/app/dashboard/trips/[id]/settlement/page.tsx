"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { TripSettlementForm } from "@/components/trip/trip-settlement-form";
import { useSchedules } from "@/hooks/useTrips";
import type { Schedule } from "@/types/route.types";

export default function TripSettlementPage() {
    const params = useParams();
    const scheduleId = params?.id as string;
    const { data: schedules, isLoading } = useSchedules();
    const currentSchedule = schedules?.find((s: Schedule) => s.id === scheduleId);

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (!currentSchedule) {
        return <div>Viaje no encontrado</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Liquidación del Viaje"
                description={`Gestiona la liquidación del viaje ${currentSchedule.route?.name || "Sin ruta"}`}
            />

            <TripSettlementForm scheduleId={scheduleId} schedule={currentSchedule} />
        </div>
    );
} 