"use client";

import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSchedules } from "@/hooks/useSchedules";
import { usePassengerList } from "@/hooks/useTrips";
import { Schedule } from "@/types/route.types";
import { PassengerList } from "@/components/trip/passenger-list";
import { TripSettlementForm } from "@/components/trip/trip-settlement-form";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function TripDetailsPage() {
    const params = useParams();
    const scheduleId = params?.id as string;
    const { data: schedules, isLoading: isLoadingSchedule } = useSchedules();
    const { data: passengers, isLoading: isLoadingPassengers } = usePassengerList(scheduleId);

    const currentSchedule = schedules?.find((s: Schedule) => s.id === scheduleId);

    if (isLoadingSchedule || isLoadingPassengers) {
        return <div>Cargando...</div>;
    }

    if (!currentSchedule) {
        return <div>Viaje no encontrado</div>;
    }

    const handlePrintPassengerList = () => {
        window.print();
    };

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title={`Viaje: ${currentSchedule.route?.name}`}
                description={`Detalles del viaje y liquidación`}
            />

            <Tabs defaultValue="details" className="w-full">
                <TabsList>
                    <TabsTrigger value="details">Detalles del Viaje</TabsTrigger>
                    <TabsTrigger value="settlement">Liquidación</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Nómina de Pasajeros</h2>
                        <Button onClick={handlePrintPassengerList} variant="outline">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir Nómina
                        </Button>
                    </div>
                    <PassengerList 
                        passengers={passengers || []} 
                        schedule={currentSchedule}
                    />
                </TabsContent>

                <TabsContent value="settlement">
                    <TripSettlementForm 
                        scheduleId={scheduleId}
                        schedule={currentSchedule}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 