import { seatTierEnum } from "@/db/schema";

export type TicketStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type Ticket = {
  id: string;
  routeId: string;
  scheduleId: string;
  seatNumber: string;
  seatTier: typeof seatTierEnum.enumValues[number];
  passengerName: string;
  passengerCI: string;
  price: number;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTicketInput = {
  routeId: string;
  scheduleId: string;
  seatNumber: string;
  seatTier: typeof seatTierEnum.enumValues[number];
  passengerName: string;
  passengerCI: string;
  price: number;
};

export type UpdateTicketStatusInput = {
  id: string;
  status: TicketStatus;
};

export type TicketWithDetails = Ticket & {
  route: {
    name: string;
    origin: string;
    destination: string;
  };
  schedule: {
    departureDate: string;
    departureTime: string;
  };
};

export type SeatSelection = {
  seatNumber: string;
  tier: typeof seatTierEnum.enumValues[number];
  isAvailable: boolean;
  isSelected: boolean;
  price: number;
}; 