import { z } from "zod";

export const driverSchema = z.object({
  fullName: z.string().min(1, "El nombre es requerido"),
  documentId: z.string().optional(),
  licenseNumber: z.string().min(1, "El número de licencia es requerido"),
  licenseCategory: z.string().min(1, "La categoría de licencia es requerida"),
  active: z.boolean().default(true),
  companyId: z.string().uuid("ID de compañía inválido"),
});

export const createDriverSchema = driverSchema.omit({ active: true, documentId: true });
export const updateDriverSchema = driverSchema.partial();

export type Driver = {
  id: string;
  fullName: string;
  documentId: string;
  licenseNumber: string;
  licenseCategory: string;
  active: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>; 