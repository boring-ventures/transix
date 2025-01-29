import { NextResponse } from "next/server";
import { db } from "@/db";
import { seatTiers, companies } from "@/db/schema";
import { createSeatTierSchema } from "@/types/bus.types";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const tiers = await db.select({
      id: seatTiers.id,
      name: seatTiers.name,
      description: seatTiers.description,
      basePrice: seatTiers.basePrice,
      isActive: seatTiers.isActive,
      companyId: seatTiers.companyId,
      createdAt: seatTiers.createdAt,
      updatedAt: seatTiers.updatedAt,
      company: {
        id: companies.id,
        name: companies.name,
        active: companies.active,
      },
    })
    .from(seatTiers)
    .leftJoin(companies, eq(seatTiers.companyId, companies.id));

    return NextResponse.json(tiers);
  } catch (error) {
    console.error("Error fetching seat tiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch seat tiers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createSeatTierSchema.parse(body);

    const [tier] = await db.insert(seatTiers)
      .values({
        companyId: validatedData.companyId,
        name: validatedData.name,
        description: validatedData.description,
        basePrice: validatedData.basePrice.toString(),
        isActive: validatedData.isActive,
      })
      .returning();

    return NextResponse.json(tier);
  } catch (error) {
    console.error("Error creating seat tier:", error);
    return NextResponse.json(
      { error: "Failed to create seat tier" },
      { status: 500 }
    );
  }
} 