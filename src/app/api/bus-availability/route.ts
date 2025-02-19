import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busId = searchParams.get("busId");
    const departureDate = searchParams.get("departureDate");
    const departureTime = searchParams.get("departureTime");
    const arrivalTime = searchParams.get("arrivalTime");

    if (!busId || !departureDate || !departureTime || !arrivalTime) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Convert date to ISO format
    const date = new Date(departureDate).toISOString().split('T')[0];
    
    // Check for existing assignments
    const existingAssignments = await prisma.bus_assignments.findMany({
      where: {
        bus_id: busId,
        AND: [
          {
            start_time: {
              lte: `${date}T${arrivalTime}:00.000Z`
            }
          },
          {
            end_time: {
              gte: `${date}T${departureTime}:00.000Z`
            }
          }
        ]
      }
    });

    return NextResponse.json({
      isAvailable: existingAssignments.length === 0,
    });
  } catch (error) {
    console.error("Error checking bus availability:", error);
    return NextResponse.json(
      { error: "Error checking bus availability" },
      { status: 500 }
    );
  }
} 