import { busTypeEnum, seatTierEnum } from "@/db/schema";

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

export type CreateBusInput = {
  companyId: string;
  plateNumber: string;
  busType: typeof busTypeEnum.enumValues[number];
  totalCapacity: number;
  maintenanceStatus?: string | null;
};

export type UpdateBusInput = {
  id: string;
  plateNumber?: string;
  busType?: typeof busTypeEnum.enumValues[number];
  totalCapacity?: number;
  isActive?: boolean;
  maintenanceStatus?: string | null;
};

export type BusTypeLabel = {
  [K in typeof busTypeEnum.enumValues[number]]: string;
}; 