import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation schemas
const createCompanySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  active: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (companyId) {
      const result = await db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);
      
      if (!result.length) {
        return NextResponse.json(
          { error: "Empresa no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0]);
    }
    // only select companies with active true
    const results = await db.select().from(companies).where(eq(companies.active, true));
    return NextResponse.json(results);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al obtener empresas";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    const [company] = await db
      .insert(companies)
      .values(validatedData)
      .returning();

    return NextResponse.json(company, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de empresa inválidos", details: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Error al crear empresa";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}