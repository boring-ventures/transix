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

    // Buscar el perfil por user_id
    const profile = await prisma.profiles.findFirst({
      where: { user_id: id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Mapear los campos del body a los nombres del modelo Prisma
    const { fullName, role, companyId, branchId, active } = body;

    const updatedProfile = await prisma.profiles.update({
      where: { id: profile.id },
      data: {
        full_name: fullName,
        role,
        company_id: companyId,
        branch_id: branchId,
        ...(typeof active !== 'undefined' && { active }),
        updated_at: new Date(),
      },
      include: {
        companies: true,
      },
    });

    // Formatear la respuesta para mantener consistencia con el GET
    const formattedUser = {
      id: updatedProfile.user_id,
      email: updatedProfile.email,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
      profile: {
        id: updatedProfile.id,
        fullName: updatedProfile.full_name,
        role: updatedProfile.role,
        active: updatedProfile.active,
        companyId: updatedProfile.company_id,
        branchId: updatedProfile.branch_id,
        createdAt: updatedProfile.created_at,
        updatedAt: updatedProfile.updated_at,
        company: updatedProfile.companies
          ? {
              id: updatedProfile.companies.id,
              name: updatedProfile.companies.name,
              active: updatedProfile.companies.active,
              createdAt: updatedProfile.companies.created_at,
              updatedAt: updatedProfile.companies.updated_at,
            }
          : null,
      },
    };

    return NextResponse.json(formattedUser);
  } catch (error: unknown) {
    console.error("Error al actualizar el usuario:", error);
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

    // Buscar el perfil por user_id
    const profile = await prisma.profiles.findFirst({
      where: { user_id: id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
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
    console.error("Error al desactivar el usuario:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al desactivar el usuario";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 