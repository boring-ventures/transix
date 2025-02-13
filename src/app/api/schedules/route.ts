import { NextResponse } from "next/server";
import { db } from "@/db";
import { schedules, routes, buses, locations, busTypeTemplates, busSeats } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { isBusAvailable } from "@/lib/routes/validation";
import { createSchedule } from "@/lib/routes/routes";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const routeId = searchParams.get("routeId");

    const results = await db
      .select({
        id: schedules.id,
        routeId: schedules.routeId,
        routeName: routes.name,
        busId: schedules.busId,
        bus: {
          id: buses.id,
          plateNumber: buses.plateNumber,
          maintenanceStatus: buses.maintenanceStatus,
          template: {
            id: busTypeTemplates.id, // este es un uuid
            //name: busTypeTemplates.name,
            type: busTypeTemplates.type, // id del template
            totalCapacity: busTypeTemplates.totalCapacity,
            seatsLayout: busTypeTemplates.seatsLayout // id del busseat
          },
          seats: busSeats.seatNumber
        },
        departureDate: schedules.departureDate,
        estimatedArrivalTime: schedules.estimatedArrivalTime,
        price: schedules.price,
        status: schedules.status
      })
      .from(schedules)
      .leftJoin(routes, eq(schedules.routeId, routes.id))
      .leftJoin(buses, eq(schedules.busId, buses.id))
      .leftJoin(busTypeTemplates, eq(buses.templateId, busTypeTemplates.id))
      .leftJoin(busSeats, eq(buses.id, busSeats.busId))
      .where(routeId ? eq(schedules.routeId, routeId) : undefined)
      .orderBy(schedules.departureDate, schedules.estimatedArrivalTime);

    const formattedResults = results.reduce((acc: any[], curr: any) => {
      const existingSchedule = acc.find(s => s.id === curr.id);
      if (existingSchedule) {
        if (curr.bus && curr.bus.seats) {
          existingSchedule.bus.seats.push(curr.bus.seats);
        }
        return acc;
      }
      
      return [...acc, {
        ...curr,
        bus: {
          ...curr.bus,
          seats: curr.bus && curr.bus.seats ? [curr.bus.seats] : []
        }
      }];
    }, []);

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Error fetching schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      routeId, 
      busId, 
      departureDate, 
      departureTime, 
      arrivalTime, 
      price,
      routeScheduleId
    } = body;

    // Check bus availability with both departure and arrival times
    const isAvailable = await isBusAvailable(
      busId,
      new Date(departureDate),
      departureTime,
      arrivalTime,
      undefined
    );

    if (!isAvailable) {
      return NextResponse.json(
        { 
          error: "Bus no disponible",
          details: "El bus ya está asignado a otra ruta en este horario. Por favor seleccione otro bus u horario."
        },
        { status: 409 }
      );
    }

    const schedule = await createSchedule(
      routeId,
      busId,
      new Date(departureDate),
      departureTime,
      price,
      routeScheduleId
    );

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { 
        error: "Error al crear el horario",
        details: error instanceof Error ? error.message : "Error inesperado"
      },
      { status: 500 }
    );
  }
} 