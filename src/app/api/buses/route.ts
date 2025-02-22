import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, seat_status_enum } from "@prisma/client";
import { createBusSchema } from "@/types/bus.types";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    // Si el companyId es "1" o no es un UUID válido, no aplicar el filtro
    const shouldFilterByCompany = companyId && isValidUUID(companyId);

    const buses = await prisma.buses.findMany({
      where: {
        is_active: true,
        ...(shouldFilterByCompany ? { company_id: companyId } : {}),
      },
      include: {
        companies: true,
        bus_type_templates: true,
        bus_seats: {
          include: {
            seat_tiers: true
          }
        }
      },
    });

    // Transform the data to match the expected format
    const transformedBuses = buses.map(bus => ({
      id: bus.id,
      plateNumber: bus.plate_number,
      companyId: bus.company_id,
      templateId: bus.template_id,
      maintenanceStatus: bus.maintenance_status_enum,
      isActive: bus.is_active,
      seatMatrix: bus.seat_matrix,
      createdAt: bus.created_at,
      updatedAt: bus.updated_at,
      company: bus.companies ? {
        id: bus.companies.id,
        name: bus.companies.name,
        active: bus.companies.active,
        createdAt: bus.companies.created_at,
        updatedAt: bus.companies.updated_at
      } : null,
      template: bus.bus_type_templates ? {
        id: bus.bus_type_templates.id,
        name: bus.bus_type_templates.name,
        type: bus.bus_type_templates.type,
        totalCapacity: bus.bus_type_templates.total_capacity,
        seatsLayout: bus.bus_type_templates.seats_layout,
        seatTemplateMatrix: bus.bus_type_templates.seat_template_matrix,
        createdAt: bus.bus_type_templates.created_at,
        updatedAt: bus.bus_type_templates.updated_at
      } : null,
      seats: bus.bus_seats.map(seat => ({
        id: seat.id,
        seatNumber: seat.seat_number,
        status: seat.status,
        tier: seat.seat_tiers ? {
          id: seat.seat_tiers.id,
          name: seat.seat_tiers.name,
          basePrice: seat.seat_tiers.base_price
        } : null
      })),
    }));

    return NextResponse.json(transformedBuses);
  } catch (error) {
    console.error("Error fetching buses:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Error fetching buses", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Validate input data
    const validationResult = createBusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation error", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // 2. Check if company exists
    const company = await prisma.companies.findUnique({
      where: {
        id: validatedData.companyId,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // 3. Check if template exists and get its data
    const template = await prisma.bus_type_templates.findUnique({
      where: {
        id: validatedData.templateId,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Bus template not found" },
        { status: 404 }
      );
    }

    // 4. Validate template data structure
    const seatMatrix = template.seat_template_matrix as {
      firstFloor: {
        seats: Array<{
          id: string;
          name: string;
          tierId: string;
          status: string;
          isEmpty: boolean;
        }>;
      };
      secondFloor?: {
        seats: Array<{
          id: string;
          name: string;
          tierId: string;
          status: string;
          isEmpty: boolean;
        }>;
      };
    };

    if (!seatMatrix?.firstFloor?.seats) {
      return NextResponse.json(
        { error: "Invalid template structure" },
        { status: 400 }
      );
    }

    // Validate that all seats have valid tierIds
    const allSeats = [
      ...seatMatrix.firstFloor.seats,
      ...(seatMatrix.secondFloor?.seats || [])
    ];

    // Filter out empty seats (they don't need a tierId)
    const nonEmptySeats = allSeats.filter(seat => !seat.isEmpty);
    
    // Check for invalid tierIds
    const invalidSeats = nonEmptySeats.filter(seat => !seat.tierId || !isValidUUID(seat.tierId));
    if (invalidSeats.length > 0) {
      console.log("Invalid seats:", invalidSeats);
      return NextResponse.json(
        { 
          error: "Invalid seat tier IDs", 
          details: `Found ${invalidSeats.length} seats with invalid tier IDs. All non-empty seats must have a valid tier ID.` 
        },
        { status: 400 }
      );
    }

    // 5. Create bus and seats in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the bus first
      const bus = await tx.buses.create({
        data: {
          company_id: validatedData.companyId,
          template_id: validatedData.templateId,
          plate_number: validatedData.plateNumber,
          maintenance_status_enum: validatedData.maintenanceStatus,
          is_active: true,
          seat_matrix: template.seat_template_matrix as Prisma.InputJsonValue,
        },
        include: {
          companies: true,
          bus_type_templates: true,
        },
      });

      // Prepare seats data
      const firstFloorSeats = seatMatrix.firstFloor.seats.map((seat) => ({
        bus_id: bus.id,
        seat_number: seat.name,
        tier_id: seat.tierId,
        status: seat_status_enum.available,
        is_active: true,
      }));

      const secondFloorSeats = seatMatrix.secondFloor?.seats?.map((seat) => ({
        bus_id: bus.id,
        seat_number: seat.name,
        tier_id: seat.tierId,
        status: seat_status_enum.available,
        is_active: true,
      })) || [];

      // Create all seats
      if (firstFloorSeats.length > 0 || secondFloorSeats.length > 0) {
        await tx.bus_seats.createMany({
          data: [...firstFloorSeats, ...secondFloorSeats],
        });
      }

      // Return the complete bus data
      return tx.buses.findUnique({
        where: { id: bus.id },
        include: {
          companies: true,
          bus_type_templates: true,
          bus_seats: {
            include: {
              seat_tiers: true,
            },
          },
        },
      });
    });

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create bus" },
        { status: 500 }
      );
    }

    // 6. Transform the result
    const transformedBus = {
      id: result.id,
      plateNumber: result.plate_number,
      companyId: result.company_id,
      templateId: result.template_id,
      maintenanceStatus: result.maintenance_status_enum,
      isActive: result.is_active,
      seatMatrix: result.seat_matrix,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      company: result.companies ? {
        id: result.companies.id,
        name: result.companies.name,
        active: result.companies.active,
        createdAt: result.companies.created_at,
        updatedAt: result.companies.updated_at
      } : null,
      template: result.bus_type_templates ? {
        id: result.bus_type_templates.id,
        name: result.bus_type_templates.name,
        type: result.bus_type_templates.type,
        totalCapacity: result.bus_type_templates.total_capacity,
        seatsLayout: result.bus_type_templates.seats_layout,
        seatTemplateMatrix: result.bus_type_templates.seat_template_matrix,
        createdAt: result.bus_type_templates.created_at,
        updatedAt: result.bus_type_templates.updated_at
      } : null,
      seats: result.bus_seats.map(seat => ({
        id: seat.id,
        seatNumber: seat.seat_number,
        status: seat.status,
        tier: seat.seat_tiers ? {
          id: seat.seat_tiers.id,
          name: seat.seat_tiers.name,
          basePrice: seat.seat_tiers.base_price
        } : null
      }))
    };

    return NextResponse.json(transformedBus);
  } catch (error) {
    console.error("Error creating bus:", error instanceof Error ? error.message : "Unknown error");
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "La placa del bus ya existe" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Error creating bus", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
} 