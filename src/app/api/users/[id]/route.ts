import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
      const { id } = await params;
    const body = await request.json();

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
      
      console.log(body)

    // Update profile
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, id))
      .returning();

    return NextResponse.json(updatedProfile);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar el usuario";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existingUser.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Instead of deleting, update the active status to false
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        active: false,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, id))
      .returning();

    return NextResponse.json(updatedProfile);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al desactivar el usuario";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 