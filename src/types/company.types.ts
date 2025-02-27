import { z } from "zod";
import { Profile } from "./user.types";

/**
 * Base Types
 */
export type Company = {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Branch = {
  id: string;
  companyId: string;
  name: string;
  address: string | null;
  city: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyWithRelations = Company & {
  branches?: Branch[];
  employees?: Profile[];
};

export type BranchWithRelations = Branch & {
  company?: Company;
  employees?: Profile[];
};

/**
 * Company Schemas
 */
const companySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").trim(),
  active: z.boolean().default(true),
});

export const createCompanySchema = companySchema;
export const updateCompanySchema = companySchema.partial();

/**
 * Branch Schemas
 */
const branchSchema = z.object({
  companyId: z.string().uuid("ID de empresa inválido"),
  name: z.string().min(1, "El nombre es requerido").trim(),
  address: z.string().optional(),
  city: z.string().optional(),
  active: z.boolean().default(true),
});

export const createBranchSchema = branchSchema;
export const updateBranchSchema = branchSchema.partial();

/**
 * Form Types
 */
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;

export interface CompanyResponse {
  id: string;
  name: string;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
} 