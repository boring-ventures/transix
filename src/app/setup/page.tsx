import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { redirect } from "next/navigation";
import { z } from "zod";

// Esquema para validar el registro del admin
const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(3),
});

// Esta función (server action) se invoca al enviar el formulario.
export async function registerAdmin(formData: FormData) {
  "use server";
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  // Validamos la entrada
  setupSchema.parse({ email, password, fullName });

  // *IMPORTANTE:* Aquí debes hashear la contraseña antes de guardarla.
  // Para demo se está guardando en texto plano, pero en producción debes usar bcrypt o similar.

  // Se crea el usuario y su perfil de admin (superadmin)
  await prisma.users.create({
    data: {
      id: uuidv4(),
      email,
      encrypted_password: password,
      profiles: {
        create: {
          full_name: fullName,
          role: "superadmin",
          active: true,
          company_id: null,
          branch_id: null,
        },
      },
    },
  });

  // Redirige al dashboard luego del registro exitoso
  redirect("/dashboard");
}

export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Se utiliza el atributo "action" del formulario para invocar la acción registerAdmin */}
      <form action={registerAdmin} method="POST" className="space-y-4 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center">Setup Superadmin</h1>
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="input"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input"
          required
        />
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          className="input"
          required
        />
        <button type="submit" className="btn w-full">
          Create Superadmin Account
        </button>
      </form>
    </div>
  );
}