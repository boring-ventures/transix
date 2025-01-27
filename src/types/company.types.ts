import { companies } from "@/db/schema";
import { InferModel } from "drizzle-orm";

export type Company = InferModel<typeof companies>;
export type CreateCompanyInput = Pick<Company, "name" | "active">;
export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export interface CompanyResponse {
  id: string;
  name: string;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
} 