import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
      const { userId } = await context.params;
    const body = await request.json();

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
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
      .where(eq(profiles.userId, userId))
      .returning();

    return NextResponse.json(updatedProfile);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar el usuario";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
      const { userId } = await context.params;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
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
      .where(eq(profiles.userId, userId))
      .returning();

    return NextResponse.json(updatedProfile);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al desactivar el usuario";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 