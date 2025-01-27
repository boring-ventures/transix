import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  context: { params: { companyId: string } }
) {
  try {
    const { companyId } = await context.params;
    const data = await request.json();

    // Check if company exists
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!existingCompany.length) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // Update company
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.id, companyId))
      .returning();

    return NextResponse.json(updatedCompany);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar la empresa";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { companyId: string } }
) {
  try {
    const { companyId } = await context.params;

    // Check if company exists
    const existingCompany = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!existingCompany.length) {
      return NextResponse.json(
        { error: "Empresa no encontrada" },
        { status: 404 }
      );
    }

    // Update company status to inactive instead of deleting
    const [updatedCompany] = await db
      .update(companies)
      .set({ active: false })
      .where(eq(companies.id, companyId))
      .returning();

    return NextResponse.json(updatedCompany);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al desactivar la empresa";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 