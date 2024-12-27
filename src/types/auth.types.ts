import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Dirección de correo electrónico inválida"),
  password: z.string().min(5, "La contraseña debe tener al menos 5 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export type AuthError = {
  message: string
} 