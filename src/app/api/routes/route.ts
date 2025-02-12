import { NextResponse } from "next/server";
import { db } from "@/db";
import { routes, locations } from "@/db/schema";
import { sql } from "drizzle-orm";
import { createRouteSchema, updateRouteSchema } from "@/types/route.types";
import { createRoute, createRouteSchedule } from "@/lib/routes/routes";

export async function GET() {
  try {
    const allRoutes = await db.select().from(routes);
    
    return NextResponse.json(allRoutes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Error al obtener las rutas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createRouteSchema.parse(body);
    const route = await createRoute(validatedData);
    
    if (body.schedule) {
      const scheduleData = {
        routeId: route.id,
        ...body.schedule
      };
      await createRouteSchedule(scheduleData);
    }
    
    return NextResponse.json(route);
  } catch (error) {
    console.error("Error creating route:", error);
    return NextResponse.json(
      { error: "Error creating route" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const routeId = body.routeId;
    if (!routeId) {
      return NextResponse.json(
        { error: "Route ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateRouteSchema.parse(body.data);
    const route = await updateRoute(routeId, validatedData);
    return NextResponse.json(route);
  } catch (error) {
    console.error("Error updating route:", error);
    return NextResponse.json(
      { error: "Error updating route" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");
    if (!routeId) {
      return NextResponse.json(
        { error: "Route ID is required" },
        { status: 400 }
      );
    }

    const route = await deleteRoute(routeId);
    return NextResponse.json(route);
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { error: "Error deleting route" },
      { status: 500 }
    );
  }
}
function updateRoute(routeId: any, validatedData: { name?: string | undefined; active?: boolean | undefined; originId?: string | undefined; destinationId?: string | undefined; estimatedDuration?: number | undefined; departureTime?: string | undefined; arrivalTime?: string | undefined; operatingDays?: string[] | undefined; }) {
  throw new Error("Function not implemented.");
}

function deleteRoute(routeId: string) {
  throw new Error("Function not implemented.");
}

