import { busTypeEnum, seatTierEnum } from "@/db/schema";

export type Location = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Route = {
  id: string;
  name: string;
  originId: string;
  destinationId: string;
  capacity: number;
  seatsTaken: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Bus = {
  id: string;
  companyId: string;
  plateNumber: string;
  busType: typeof busTypeEnum.enumValues[number];
  totalCapacity: number;
  isActive: boolean;
  maintenanceStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BusSeat = {
  id: string;
  busId: string;
  seatNumber: string;
  tier: typeof seatTierEnum.enumValues[number];
  deck: number;
  isActive: boolean;
  createdAt: Date;
};

export type Schedule = {
  id: string;
  routeId: string;
  busId: string;
  departureDate: string;
  departureTime: string;
  price: number;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
};

// Form input types
export type CreateRouteInput = {
  name: string;
  originId: string;
  destinationId: string;
  capacity: number;
};

export type CreateScheduleInput = {
  routeId: string;
  busId: string;
  departureDate: string;
  departureTime: string;
  price: number;
  capacity: number;
}; 