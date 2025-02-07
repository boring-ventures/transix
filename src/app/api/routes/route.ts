import { NextResponse } from "next/server";
import { db } from "@/db";
import { routes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createRouteSchema, updateRouteSchema } from "@/types/route.types";
import { getRouteById, createRoute, updateRoute, deleteRoute } from "@/lib/routes/routes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");
    const companyId = searchParams.get("companyId");

    if (routeId) {
      const route = await getRouteById(routeId);
      if (!route) {
        return NextResponse.json(
          { error: "Route not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(route);
    }

    if (companyId) {
      const companyRoutes = await db.query.routes.findMany({
        where: (routes, { eq, and }) =>
          and(eq(routes.companyId, companyId), eq(routes.active, true)),
        with: {
          origin: true,
          destination: true,
        },
      });
      return NextResponse.json(companyRoutes);
    }

    const allRoutes = await db.query.routes.findMany({
      where: eq(routes.active, true),
      with: {
        origin: true,
        destination: true,
      },
    });
    return NextResponse.json(allRoutes);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Error fetching routes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = createRouteSchema.parse(body);
    const route = await createRoute(validatedData);
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
