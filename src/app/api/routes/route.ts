import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRouteSchema, updateRouteSchema } from "@/types/route.types";

export async function GET() {
  try {
    const allRoutes = await prisma.routes.findMany({
      include: {
        locations_routes_origin_idTolocations: true,
        locations_routes_destination_idTolocations: true,
        route_schedules: true,
      },
    });
    
    // Transform the data to match the expected format
    const transformedRoutes = allRoutes.map(route => ({
      id: route.id,
      name: route.name,
      originId: route.origin_id,
      destinationId: route.destination_id,
      estimatedDuration: route.estimated_duration,
      active: route.active,
      createdAt: route.created_at,
      updatedAt: route.updated_at,
      origin: route.locations_routes_origin_idTolocations ? {
        id: route.locations_routes_origin_idTolocations.id,
        name: route.locations_routes_origin_idTolocations.name,
        createdAt: route.locations_routes_origin_idTolocations.created_at,
        updatedAt: route.locations_routes_origin_idTolocations.updated_at,
      } : undefined,
      destination: route.locations_routes_destination_idTolocations ? {
        id: route.locations_routes_destination_idTolocations.id,
        name: route.locations_routes_destination_idTolocations.name,
        createdAt: route.locations_routes_destination_idTolocations.created_at,
        updatedAt: route.locations_routes_destination_idTolocations.updated_at,
      } : undefined,
      routeSchedules: route.route_schedules.map(schedule => ({
        id: schedule.id,
        routeId: schedule.route_id,
        departureTime: schedule.departure_time.toTimeString().slice(0, 5),
        operatingDays: schedule.operating_days,
        active: schedule.active,
        seasonStart: schedule.season_start,
        seasonEnd: schedule.season_end,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
      })),
    }));
    
    return NextResponse.json(transformedRoutes);
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
    
    const route = await prisma.routes.create({
      data: {
        name: validatedData.name,
        origin_id: validatedData.originId,
        destination_id: validatedData.destinationId,
        estimated_duration: validatedData.estimatedDuration,
        active: validatedData.active,
      },
      include: {
        locations_routes_origin_idTolocations: true,
        locations_routes_destination_idTolocations: true,
      },
    });
    
    // Transform the response to match the expected format
    const transformedRoute = {
      id: route.id,
      name: route.name,
      originId: route.origin_id,
      destinationId: route.destination_id,
      estimatedDuration: route.estimated_duration,
      active: route.active,
      createdAt: route.created_at,
      updatedAt: route.updated_at,
      origin: route.locations_routes_origin_idTolocations ? {
        id: route.locations_routes_origin_idTolocations.id,
        name: route.locations_routes_origin_idTolocations.name,
        createdAt: route.locations_routes_origin_idTolocations.created_at,
        updatedAt: route.locations_routes_origin_idTolocations.updated_at,
      } : undefined,
      destination: route.locations_routes_destination_idTolocations ? {
        id: route.locations_routes_destination_idTolocations.id,
        name: route.locations_routes_destination_idTolocations.name,
        createdAt: route.locations_routes_destination_idTolocations.created_at,
        updatedAt: route.locations_routes_destination_idTolocations.updated_at,
      } : undefined,
    };
    
    if (body.schedule) {
      await prisma.route_schedules.create({
        data: {
          route_id: route.id,
          departure_time: new Date(`1970-01-01T${body.schedule.departureTime}:00.000Z`),
          operating_days: body.schedule.operatingDays,
          active: body.schedule.active,
          season_start: body.schedule.seasonStart,
          season_end: body.schedule.seasonEnd,
        },
      });
    }
    
    return NextResponse.json(transformedRoute);
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
    
    const route = await prisma.routes.update({
      where: { id: routeId },
      data: {
        name: validatedData.name,
        origin_id: validatedData.originId,
        destination_id: validatedData.destinationId,
        estimated_duration: validatedData.estimatedDuration,
        active: validatedData.active,
      },
      include: {
        locations_routes_origin_idTolocations: true,
        locations_routes_destination_idTolocations: true,
      },
    });
    
    // Transform the response to match the expected format
    const transformedRoute = {
      id: route.id,
      name: route.name,
      originId: route.origin_id,
      destinationId: route.destination_id,
      estimatedDuration: route.estimated_duration,
      active: route.active,
      createdAt: route.created_at,
      updatedAt: route.updated_at,
      origin: route.locations_routes_origin_idTolocations ? {
        id: route.locations_routes_origin_idTolocations.id,
        name: route.locations_routes_origin_idTolocations.name,
        createdAt: route.locations_routes_origin_idTolocations.created_at,
        updatedAt: route.locations_routes_origin_idTolocations.updated_at,
      } : undefined,
      destination: route.locations_routes_destination_idTolocations ? {
        id: route.locations_routes_destination_idTolocations.id,
        name: route.locations_routes_destination_idTolocations.name,
        createdAt: route.locations_routes_destination_idTolocations.created_at,
        updatedAt: route.locations_routes_destination_idTolocations.updated_at,
      } : undefined,
    };
    
    return NextResponse.json(transformedRoute);
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

    const route = await prisma.routes.delete({
      where: { id: routeId },
    });
    
    // Transform the response to match the expected format
    const transformedRoute = {
      id: route.id,
      name: route.name,
      originId: route.origin_id,
      destinationId: route.destination_id,
      estimatedDuration: route.estimated_duration,
      active: route.active,
      createdAt: route.created_at,
      updatedAt: route.updated_at,
    };
    
    return NextResponse.json(transformedRoute);
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json(
      { error: "Error deleting route" },
      { status: 500 }
    );
  }
}

