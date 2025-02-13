import { z } from "zod";

export const locationSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "El nombre es requerido"),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Location = z.infer<typeof locationSchema>; 