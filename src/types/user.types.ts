import { users, profiles, roleEnum } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { z } from "zod";

export type User = InferSelectModel<typeof users>;
export type Profile = InferSelectModel<typeof profiles>;

export type UserWithProfile = User & {
  profile?: Profile;
};

export type CreateUserInput = {
  email: string;
  password: string;
};

export type CreateProfileInput = {
  fullName: string;
  role: typeof roleEnum.enumValues[number];
  companyId?: string;
  branchId?: string;
  active: boolean;
};

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const insertProfileSchema = z.object({
  fullName: z.string().min(3),
  role: z.enum(roleEnum.enumValues),
  companyId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(),
  active: z.boolean().default(true),
});

export type InsertUserInput = z.infer<typeof insertUserSchema>;
export type InsertProfileInput = z.infer<typeof insertProfileSchema>;
