import { NextResponse } from "next/server";
import { db } from "@/db";
import { busTypeTemplates, companies, seatTiers } from "@/db/schema";
import { createBusTypeTemplateSchema } from "@/types/bus.types";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const templates = await db.select({
      id: busTypeTemplates.id,
      name: busTypeTemplates.name,
      description: busTypeTemplates.description,
      companyId: busTypeTemplates.companyId,
      totalCapacity: busTypeTemplates.totalCapacity,
      seatTemplateMatrix: busTypeTemplates.seatTemplateMatrix,
      isActive: busTypeTemplates.isActive,
      createdAt: busTypeTemplates.createdAt,
      updatedAt: busTypeTemplates.updatedAt,
      company: {
        id: companies.id,
        name: companies.name,
        active: companies.active,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
      },
    })
    .from(busTypeTemplates)
    .leftJoin(companies, eq(busTypeTemplates.companyId, companies.id))
    .where(eq(busTypeTemplates.isActive, true));

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching bus templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch bus templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createBusTypeTemplateSchema.parse(body);

    const template = await db.transaction(async (tx) => {
      // Create the bus template
      const [newTemplate] = await tx.insert(busTypeTemplates).values({
        companyId: validatedData.companyId,
        name: validatedData.name,
        description: validatedData.description,
        totalCapacity: validatedData.totalCapacity,
        seatTemplateMatrix: validatedData.seatTemplateMatrix,   
        isActive: validatedData.isActive,
      }).returning();

      // Create the seat tiers
      if (validatedData.seatTiers?.length > 0) {
        await tx.insert(seatTiers).values(
          validatedData.seatTiers.map(tier => ({
            companyId: validatedData.companyId,
            name: tier.name,
            description: tier.description,
            basePrice: tier.basePrice.toString(),
            isActive: tier.isActive,
          }))
        );
      }

      return newTemplate;
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating bus template:", error);
    return NextResponse.json(
      { error: "Failed to create bus template" },
      { status: 500 }
    );
  }
} 