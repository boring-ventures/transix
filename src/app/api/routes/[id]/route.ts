import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateRouteSchema } from "@/types/route.types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const route = await prisma.routes.findUnique({
      where: { id },
      include: {
        locations_routes_origin_idTolocations: true,
        locations_routes_destination_idTolocations: true,
        route_schedules: true,
      },
    });

    if (!route) {
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    // Transform the response to match the expected format
    const transformedRoute = {
      id: route.id,
      name: route.name,
      originId: route.origin_id,
      destinationId: route.destination_id,
      estimatedDuration: route.estimated_duration,
      departureLane: route.departure_lane,
      active: route.active,
      createdAt: route.created_at,
      updatedAt: route.updated_at,
      origin: route.locations_routes_origin_idTolocations ? {
        id: route.locations_routes_origin_idTolocations.id,
        name: route.locations_routes_origin_idTolocations.name,
        createdAt: route.locations_routes_origin_idTolocations.created_at,
        updatedAt: route.locations_routes_origin_idTolocations.updated_at,
      } : null,
      destination: route.locations_routes_destination_idTolocations ? {
        id: route.locations_routes_destination_idTolocations.id,
        name: route.locations_routes_destination_idTolocations.name,
        createdAt: route.locations_routes_destination_idTolocations.created_at,
        updatedAt: route.locations_routes_destination_idTolocations.updated_at,
      } : null,
      routeSchedules: route.route_schedules.map(schedule => ({
        id: schedule.id,
        routeId: schedule.route_id,
        departureTime: schedule.departure_time,
        operatingDays: schedule.operating_days,
        active: schedule.active,
        seasonStart: schedule.season_start,
        seasonEnd: schedule.season_end,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
      })),
    };

    return NextResponse.json(transformedRoute);
  } catch (error) {
    console.error("Error fetching route:", error);
    return NextResponse.json(
      { error: "Error al obtener la ruta" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const routeData = updateRouteSchema.parse(body);

    // Check if route exists
    const existingRoute = await prisma.routes.findUnique({
      where: { id }
    });

    if (!existingRoute) {
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    // Transform the input data to match Prisma schema
    const prismaData = {
      name: routeData.name,
      origin_id: routeData.originId,
      destination_id: routeData.destinationId,
      estimated_duration: routeData.estimatedDuration,
      departure_lane: routeData.departureLane,
      active: routeData.active,
      updated_at: new Date(),
    };

    // Update route
    const updatedRoute = await prisma.routes.update({
      where: { id },
      data: prismaData,
      include: {
        locations_routes_origin_idTolocations: true,
        locations_routes_destination_idTolocations: true,
        route_schedules: true,
      },
    });

    // Transform the response to match the expected format
    const transformedRoute = {
      id: updatedRoute.id,
      name: updatedRoute.name,
      originId: updatedRoute.origin_id,
      destinationId: updatedRoute.destination_id,
      estimatedDuration: updatedRoute.estimated_duration,
      departureLane: updatedRoute.departure_lane,
      active: updatedRoute.active,
      createdAt: updatedRoute.created_at,
      updatedAt: updatedRoute.updated_at,
      origin: updatedRoute.locations_routes_origin_idTolocations ? {
        id: updatedRoute.locations_routes_origin_idTolocations.id,
        name: updatedRoute.locations_routes_origin_idTolocations.name,
        createdAt: updatedRoute.locations_routes_origin_idTolocations.created_at,
        updatedAt: updatedRoute.locations_routes_origin_idTolocations.updated_at,
      } : null,
      destination: updatedRoute.locations_routes_destination_idTolocations ? {
        id: updatedRoute.locations_routes_destination_idTolocations.id,
        name: updatedRoute.locations_routes_destination_idTolocations.name,
        createdAt: updatedRoute.locations_routes_destination_idTolocations.created_at,
        updatedAt: updatedRoute.locations_routes_destination_idTolocations.updated_at,
      } : null,
      routeSchedules: updatedRoute.route_schedules.map(schedule => ({
        id: schedule.id,
        routeId: schedule.route_id,
        departureTime: schedule.departure_time,
        operatingDays: schedule.operating_days,
        active: schedule.active,
        seasonStart: schedule.season_start,
        seasonEnd: schedule.season_end,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
      })),
    };

    return NextResponse.json(transformedRoute);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al actualizar la ruta";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if route exists
    const existingRoute = await prisma.routes.findUnique({
      where: { id },
      include: {
        route_schedules: {
          include: {
            schedules: true
          }
        },
        bus_assignments: true
      }
    });

    if (!existingRoute) {
      return NextResponse.json(
        { error: "Ruta no encontrada" },
        { status: 404 }
      );
    }

    // Check for dependencies
    const dependencies = {
      routeSchedules: existingRoute.route_schedules.length > 0,
      schedules: existingRoute.route_schedules.some(rs => rs.schedules.length > 0),
      busAssignments: existingRoute.bus_assignments.length > 0
    };

    if (Object.values(dependencies).some(Boolean)) {
      return NextResponse.json(
        {
          error: "No se puede eliminar la ruta porque tiene dependencias",
          details: {
            message: "La ruta tiene registros relacionados que impiden su eliminación",
            dependencies: Object.entries(dependencies)
              .filter(([, hasRecords]) => hasRecords)
              .map(([type]) => type)
          }
        },
        { status: 400 }
      );
    }

    // Instead of deleting, update the active status to false
    const updatedRoute = await prisma.routes.update({
      where: { id },
      data: {
        active: false,
        updated_at: new Date(),
      },
      include: {
        locations_routes_origin_idTolocations: true,
        locations_routes_destination_idTolocations: true,
        route_schedules: true,
      },
    });

    // Transform the response to match the expected format
    const transformedRoute = {
      id: updatedRoute.id,
      name: updatedRoute.name,
      originId: updatedRoute.origin_id,
      destinationId: updatedRoute.destination_id,
      estimatedDuration: updatedRoute.estimated_duration,
      departureLane: updatedRoute.departure_lane,
      active: updatedRoute.active,
      createdAt: updatedRoute.created_at,
      updatedAt: updatedRoute.updated_at,
      origin: updatedRoute.locations_routes_origin_idTolocations ? {
        id: updatedRoute.locations_routes_origin_idTolocations.id,
        name: updatedRoute.locations_routes_origin_idTolocations.name,
        createdAt: updatedRoute.locations_routes_origin_idTolocations.created_at,
        updatedAt: updatedRoute.locations_routes_origin_idTolocations.updated_at,
      } : null,
      destination: updatedRoute.locations_routes_destination_idTolocations ? {
        id: updatedRoute.locations_routes_destination_idTolocations.id,
        name: updatedRoute.locations_routes_destination_idTolocations.name,
        createdAt: updatedRoute.locations_routes_destination_idTolocations.created_at,
        updatedAt: updatedRoute.locations_routes_destination_idTolocations.updated_at,
      } : null,
      routeSchedules: updatedRoute.route_schedules.map(schedule => ({
        id: schedule.id,
        routeId: schedule.route_id,
        departureTime: schedule.departure_time,
        operatingDays: schedule.operating_days,
        active: schedule.active,
        seasonStart: schedule.season_start,
        seasonEnd: schedule.season_end,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at,
      })),
    };

    return NextResponse.json(transformedRoute);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error al desactivar la ruta";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 