import { z } from "zod";
import { Company } from "./company.types";
import { role_enum } from "@prisma/client";

/**
 * Base Types
 */
export type User = {
  id: string;
  email: string;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Profile = {
  id: string;
  userId: string;
  fullName: string;
  role: role_enum;
  companyId: string | null;
  branchId: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithProfile = User & {
  profile?: Profile;
  company?: Company;
};

/**
 * Form Schemas
 */
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  fullName: z.string().min(1, "El nombre completo es requerido").trim(),
  role: z.nativeEnum(role_enum),
  companyId: z.union([
    z.string().uuid("ID de empresa inválido"),
    z.literal("")
  ]).transform((val) => (val === "" ? null : val)),
});

export const updateUserSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  fullName: z.string().min(1, "El nombre completo es requerido").trim(),
  role: z.nativeEnum(role_enum),
  companyId: z.union([
    z.string().uuid("ID de empresa inválido"),
    z.literal("")
  ]).transform((val) => (val === "" ? null : val)),
});

/**
 * API Types
 */
export interface CreateUserRequest {
  user: {
    email: string;
    password: string;
  };
  profile: {
    fullName: string;
    role: role_enum;
    companyId: string | null;
    branchId: string | null;
    active: boolean;
  };
}

export interface UpdateProfileRequest {
  profileId: string;
  data: {
    fullName?: string;
    role?: role_enum;
    companyId?: string | null;
    active?: boolean;
  };
}

/**
 * API Schemas
 */
const userApiSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  emailVerified: z.date().nullable().optional(),
});

export const createUserApiSchema = userApiSchema;
export const updateUserApiSchema = userApiSchema.partial();

/**
 * Profile Schemas
 */
const profileSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido").trim(),
  role: z.nativeEnum(role_enum),
  companyId: z.string().uuid("ID de empresa inválido").nullable(),
  branchId: z.string().uuid("ID de sucursal inválido").nullable(),
  active: z.boolean().default(true),
});

export const createProfileSchema = profileSchema;
export const updateProfileSchema = profileSchema.partial();

/**
 * Form Types
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type CreateProfileInput = {
  fullName: string;
  role: role_enum;
  companyId: string | null;
  branchId: string | null;
  active: boolean;
};

export type UpdateProfileInput = {
  fullName?: string;
  role?: role_enum;
  companyId?: string | null;
  active?: boolean;
};

export const insertUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const insertProfileSchema = z.object({
  fullName: z.string().min(1, "El nombre completo es requerido").trim(),
  role: z.nativeEnum(role_enum),
  companyId: z.string().uuid("ID de empresa inválido").nullable(),
  branchId: z.string().uuid("ID de sucursal inválido").nullable(),
  active: z.boolean().default(true),
});
