"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { settlement_status_enum } from "@prisma/client";

interface Fare {
    seatNumber: string;
    amount: number;
}

interface Expense {
    description: string;
    amount: number;
}

interface TripSettlement {
    id: string;
    scheduleId: string;
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
    status: settlement_status_enum;
    settledAt: Date | null;
    details: {
        fares: Fare[];
        expenses: Expense[];
        packages: number;
    };
}

interface CreateTripSettlementData {
    scheduleId: string;
    totalIncome: number;
    totalExpenses: number;
    details: {
        fares: Fare[];
        expenses: Expense[];
        packages: number;
    };
}

interface UpdateTripSettlementData {
    scheduleId: string;
    data: {
        totalIncome: number;
        totalExpenses: number;
        details: {
            fares: Fare[];
            expenses: Expense[];
            packages: number;
        };
        status: settlement_status_enum;
    };
}

export function usePassengerList(scheduleId: string) {
    return useQuery({
        queryKey: ["passenger-list", scheduleId],
        queryFn: async () => {
            if (!scheduleId) return [];
            const response = await fetch(`/api/trips/${scheduleId}/passengers`);
            if (!response.ok) {
                if (response.status === 404) {
                    return []; // Return empty array if no passengers found
                }
                throw new Error("Error al obtener la lista de pasajeros");
            }
            return response.json();
        },
        enabled: !!scheduleId,
    });
}

export function useTripSettlement(scheduleId: string) {
    return useQuery({
        queryKey: ["trip-settlement", scheduleId],
        queryFn: async () => {
            const response = await fetch(`/api/trips/${scheduleId}/settlement`);
            if (!response.ok) {
                throw new Error("Error al obtener la liquidación");
            }
            return response.json() as Promise<TripSettlement>;
        },
    });
}

export function useCreateTripSettlement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateTripSettlementData) => {
            const response = await fetch(`/api/trips/${data.scheduleId}/settlement`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Error al crear la liquidación");
            }

            return response.json() as Promise<TripSettlement>;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["trip-settlement", variables.scheduleId],
            });
        },
    });
}

export function useUpdateTripSettlement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ scheduleId, data }: UpdateTripSettlementData) => {
            const response = await fetch(`/api/trips/${scheduleId}/settlement`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar la liquidación");
            }

            return response.json() as Promise<TripSettlement>;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["trip-settlement", variables.scheduleId],
            });
        },
    });
}

export function useSchedules(scheduleId?: string) {
    return useQuery({
        queryKey: ["schedules", scheduleId],
        queryFn: async () => {
            const url = scheduleId
                ? `/api/schedules/${scheduleId}`
                : "/api/schedules";
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Error al obtener los horarios");
            }
            return response.json();
        },
    });
} 