import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSeatTierSchema } from "@/types/bus.types";

export async function GET() {
  try {
    const tiers = await prisma.seat_tiers.findMany({
      include: {
        companies: true,
      },
    });

    // Transform the data to match the expected format
    const transformedTiers = tiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      description: tier.description,
      basePrice: tier.base_price,
      isActive: tier.is_active,
      companyId: tier.company_id,
      createdAt: tier.created_at,
      updatedAt: tier.updated_at,
      company: tier.companies ? {
        id: tier.companies.id,
        name: tier.companies.name,
        active: tier.companies.active,
      } : null,
    }));

    return NextResponse.json(transformedTiers);
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
    
    // Log the received data
    console.log('Received data:', body);

    const validatedData = createSeatTierSchema.parse(body);
    
    // Log the validated data
    console.log('Validated data:', validatedData);

    const tier = await prisma.seat_tiers.create({
      data: {
        company_id: validatedData.companyId,
        name: validatedData.name,
        description: validatedData.description,
        base_price: validatedData.basePrice,
        is_active: validatedData.isActive,
      },
      include: {
        companies: true,
      },
    });

    // Transform the response to match the expected format
    const transformedTier = {
      id: tier.id,
      name: tier.name,
      description: tier.description,
      basePrice: Number(tier.base_price),
      isActive: tier.is_active,
      companyId: tier.company_id,
      createdAt: tier.created_at,
      updatedAt: tier.updated_at,
      company: tier.companies ? {
        id: tier.companies.id,
        name: tier.companies.name,
        active: tier.companies.active,
      } : null,
    };

    return NextResponse.json(transformedTier);
  } catch (error) {
    console.error("Error creating seat tier:", error);
    
    // Mejorar el mensaje de error
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create seat tier" },
      { status: 500 }
    );
  }
} 