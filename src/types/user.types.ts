import { users, profiles, roleEnum } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export type User = InferSelectModel<typeof users>;
export type Profile = InferSelectModel<typeof profiles>;

export type UserWithProfile = User & {
  profile?: Profile;
};

// Base schema for user forms
const baseUserFormSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(1, "El nombre es requerido"),
  role: z.enum(roleEnum.enumValues),
  companyId: z.string().nullable(),
});

// Schema for creating a new user
export const createUserFormSchema = baseUserFormSchema
  .extend({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "superadmin" && !data.companyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La empresa es requerida para roles que no son superadmin",
        path: ["companyId"],
      });
    }
  });

// Schema for editing a user
export const editUserFormSchema = baseUserFormSchema.superRefine((data, ctx) => {
  if (data.role !== "superadmin" && !data.companyId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La empresa es requerida para roles que no son superadmin",
      path: ["companyId"],
    });
  }
});

// Form data types
export type CreateUserFormData = z.infer<typeof createUserFormSchema>;
export type EditUserFormData = z.infer<typeof editUserFormSchema>;

// API input types
export type CreateUserInput = {
  email: string;
  password: string;
};

export type CreateProfileInput = {
  fullName: string;
  role: typeof roleEnum.enumValues[number];
  companyId: string | null;
  branchId: string | null;
  active: boolean;
};

// API schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const insertProfileSchema = z.object({
  fullName: z.string().min(3),
  role: z.enum(roleEnum.enumValues),
  companyId: z.string().uuid().nullable(),
  branchId: z.string().uuid().nullable(),
  active: z.boolean().default(true),
});

export type InsertUserInput = z.infer<typeof insertUserSchema>;
export type InsertProfileInput = z.infer<typeof insertProfileSchema>;
