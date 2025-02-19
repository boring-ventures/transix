import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log("PATCH body:", body);

    // Verifica que el usuario exista
    const existingUser = await prisma.profiles.findUnique({
      where: { id },
    });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Mapear los campos del body a los nombres del modelo Prisma
    const { fullName, role, companyId, branchId, active } = body;

    // Buscar el perfil asociado al usuario por user_id
    const profile = await prisma.profiles.findFirst({
      where: { user_id: id },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    const updatedProfile = await prisma.profiles.update({
      where: { id: profile.id },
      data: {
        full_name: fullName,
        role,
        company_id: companyId,
        branch_id: branchId,
        active,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al actualizar el usuario";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verifica que el usuario exista
    const existingUser = await prisma.profiles.findUnique({
      where: { id },
    });
    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Buscar el perfil correspondiente por user_id
    const profile = await prisma.profiles.findFirst({
      where: { user_id: id },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    const updatedProfile = await prisma.profiles.update({
      where: { id: profile.id },
      data: {
        active: false,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error al desactivar el usuario";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 