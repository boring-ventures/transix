import { parcelStatusEnum } from "@/db/schema";

export type Parcel = {
  id: string;
  trackingNumber: string;
  sender: string;
  recipient: string;
  fromCity: string;
  toCity: string;
  weight: number;
  price: number;
  status: typeof parcelStatusEnum.enumValues[number];
  createdAt: Date;
  updatedAt: Date;
};

export type CreateParcelInput = {
  sender: string;
  recipient: string;
  fromCity: string;
  toCity: string;
  weight: number;
  price: number;
};

export type UpdateParcelStatusInput = {
  id: string;
  status: typeof parcelStatusEnum.enumValues[number];
}; 