import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format, parseISO, setHours, setMinutes, parse, eachDayOfInterval } from "date-fns";
import { Decimal } from "@prisma/client/runtime/library";
import { NextRequest } from "next/server";
import { z } from "zod";
import { schedule_status_enum } from "@prisma/client";
import { enUS } from "date-fns/locale";

const updateScheduleSchema = z.object({
  id: z.string().uuid(),
  departure_date: z.coerce.date(),
  price: z.number().min(0),
  busId: z.string().uuid().optional(),
  primaryDriverId: z.string().uuid().optional(),
  secondaryDriverId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const routeScheduleId = searchParams.get('routeScheduleId');

    const schedules = await prisma.schedules.findMany({
      where: {
        ...(routeScheduleId ? { route_schedule_id: routeScheduleId } : {}),
        status: 'scheduled', // Only show scheduled trips
      },
      include: {
        routes: true,
        route_schedules: {
          include: {
            routes: true
          }
        },
        bus_assignments: {
          where: {
            status: 'active'
          },
          include: {
            buses: {
              include: {
                bus_type_templates: true,
                bus_seats: {
                  include: {
                    seat_tiers: true
                  }
                }
              }
            }
          }
        },
        buses: {
          include: {
            bus_type_templates: true,
            bus_seats: {
              include: {
                seat_tiers: true
              }
            }
          }
        },
        primary_driver: true,
        secondary_driver: true
      },
    });

    // Transform the data to match the expected format
    const transformedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      routeId: schedule.route_id,
      routeScheduleId: schedule.route_schedule_id,
      busId: schedule.bus_id,
      primaryDriverId: schedule.primary_driver_id,
      secondaryDriverId: schedule.secondary_driver_id,
      departureDate: schedule.departure_date,
      estimatedArrivalTime: schedule.estimated_arrival_time,
      actualDepartureTime: schedule.actual_departure_time,
      actualArrivalTime: schedule.actual_arrival_time,
      price: schedule.price,
      status: schedule.status,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
      route: schedule.routes ? {
        id: schedule.routes.id,
        name: schedule.routes.name,
        originId: schedule.routes.origin_id,
        destinationId: schedule.routes.destination_id,
        estimatedDuration: schedule.routes.estimated_duration,
      } : null,
      bus: schedule.buses ? {
        id: schedule.buses.id,
        plateNumber: schedule.buses.plate_number,
        template: schedule.buses.bus_type_templates ? {
          id: schedule.buses.bus_type_templates.id,
          name: schedule.buses.bus_type_templates.name,
          type: schedule.buses.bus_type_templates.type,
        } : undefined,
        seats: schedule.buses.bus_seats.map(seat => ({
          id: seat.id,
          seatNumber: seat.seat_number,
          status: seat.status,
          tier: seat.seat_tiers ? {
            id: seat.seat_tiers.id,
            name: seat.seat_tiers.name,
            basePrice: seat.seat_tiers.base_price
          } : undefined
        }))
      } : undefined,
      primaryDriver: schedule.primary_driver ? {
        id: schedule.primary_driver.id,
        fullName: schedule.primary_driver.full_name,
        documentId: schedule.primary_driver.document_id,
        licenseNumber: schedule.primary_driver.license_number,
        licenseCategory: schedule.primary_driver.license_category,
      } : undefined,
      secondaryDriver: schedule.secondary_driver ? {
        id: schedule.secondary_driver.id,
        fullName: schedule.secondary_driver.full_name,
        documentId: schedule.secondary_driver.document_id,
        licenseNumber: schedule.secondary_driver.license_number,
        licenseCategory: schedule.secondary_driver.license_category,
      } : undefined,
    }));

    return NextResponse.json(transformedSchedules);
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
    console.log('Received schedule creation request:', body);

    const {
      routeId,
      routeScheduleId,
      startDate,
      endDate,
      price,
      status = 'scheduled',
      busId,
      primaryDriverId,
      secondaryDriverId
    } = body;

    // Get the route schedule to get departure time and estimated arrival time
    const routeSchedule = await prisma.route_schedules.findUnique({
      where: { id: routeScheduleId },
      include: {
        routes: true
      }
    });

    if (!routeSchedule) {
      return NextResponse.json(
        { error: "Route schedule not found" },
        { status: 404 }
      );
    }

    // Parse dates
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Get all dates between start and end that match operating days
    const dates = eachDayOfInterval({ start, end }).filter((date) =>
      routeSchedule.operating_days.includes(format(date, 'EEEE', { locale: enUS }).toLowerCase())
    );

    // Create schedules for each date
    const createdSchedules = await Promise.all(
      dates.map(async (date) => {
        // Combine date with departure time
        const departureDateTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          routeSchedule.departure_time.getHours(),
          routeSchedule.departure_time.getMinutes()
        );

        // Calculate estimated arrival time
        const estimatedArrivalDateTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          routeSchedule.estimated_arrival_time.getHours(),
          routeSchedule.estimated_arrival_time.getMinutes()
        );

        // Create the schedule
        const schedule = await prisma.schedules.create({
          data: {
            route_id: routeId,
            route_schedule_id: routeScheduleId,
            bus_id: busId,
            primary_driver_id: primaryDriverId || null,
            secondary_driver_id: secondaryDriverId || null,
            departure_date: departureDateTime,
            estimated_arrival_time: estimatedArrivalDateTime,
            actual_departure_time: null,
            actual_arrival_time: null,
            price: price || 0,
            status: status,
          },
          include: {
            routes: true,
            buses: {
              include: {
                bus_type_templates: true,
                bus_seats: {
                  include: {
                    seat_tiers: true
                  }
                }
              }
            },
            primary_driver: true,
            secondary_driver: true
          }
        });

        // If a bus is assigned, create a bus assignment
        if (busId) {
          await prisma.bus_assignments.create({
            data: {
              bus_id: busId,
              route_id: routeId,
              schedule_id: schedule.id,
              start_time: departureDateTime,
              end_time: estimatedArrivalDateTime,
              status: 'active',
            }
          });
        }

        return schedule;
      })
    );

    // Transform the response to match the expected format
    const transformedSchedules = createdSchedules.map(schedule => ({
      id: schedule.id,
      routeId: schedule.route_id,
      routeScheduleId: schedule.route_schedule_id,
      busId: schedule.bus_id,
      primaryDriverId: schedule.primary_driver_id,
      secondaryDriverId: schedule.secondary_driver_id,
      departureDate: schedule.departure_date,
      estimatedArrivalTime: schedule.estimated_arrival_time,
      actualDepartureTime: schedule.actual_departure_time,
      actualArrivalTime: schedule.actual_arrival_time,
      price: schedule.price,
      status: schedule.status,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
      route: schedule.routes ? {
        id: schedule.routes.id,
        name: schedule.routes.name,
        originId: schedule.routes.origin_id,
        destinationId: schedule.routes.destination_id,
        estimatedDuration: schedule.routes.estimated_duration,
        active: schedule.routes.active,
      } : undefined,
      bus: schedule.buses ? {
        id: schedule.buses.id,
        plateNumber: schedule.buses.plate_number,
        template: schedule.buses.bus_type_templates ? {
          id: schedule.buses.bus_type_templates.id,
          name: schedule.buses.bus_type_templates.name,
          type: schedule.buses.bus_type_templates.type,
        } : undefined,
        seats: schedule.buses.bus_seats.map(seat => ({
          id: seat.id,
          seatNumber: seat.seat_number,
          status: seat.status,
          tier: seat.seat_tiers ? {
            id: seat.seat_tiers.id,
            name: seat.seat_tiers.name,
            basePrice: seat.seat_tiers.base_price
          } : undefined
        }))
      } : undefined,
      primaryDriver: schedule.primary_driver ? {
        id: schedule.primary_driver.id,
        fullName: schedule.primary_driver.full_name,
        documentId: schedule.primary_driver.document_id,
        licenseNumber: schedule.primary_driver.license_number,
        licenseCategory: schedule.primary_driver.license_category,
      } : undefined,
      secondaryDriver: schedule.secondary_driver ? {
        id: schedule.secondary_driver.id,
        fullName: schedule.secondary_driver.full_name,
        documentId: schedule.secondary_driver.document_id,
        licenseNumber: schedule.secondary_driver.license_number,
        licenseCategory: schedule.secondary_driver.license_category,
      } : undefined,
    }));

    return NextResponse.json(transformedSchedules);
  } catch (error) {
    console.error("Error creating schedules:", error);
    return NextResponse.json(
      { error: "Error creating schedules", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateScheduleSchema.parse(body);

    // Get the route schedule to get departure time and estimated arrival time
    const schedule = await prisma.schedules.findUnique({
      where: { id: validatedData.id },
      include: {
        route_schedules: true,
        routes: true
      }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Get departure time from route_schedules
    const departureTime = format(schedule.route_schedules.departure_time, 'HH:mm');
    const [hours, minutes] = departureTime.split(':').map(Number);

    // Set departure time for the new date
    const departureDateTime = setMinutes(setHours(validatedData.departure_date, hours), minutes);
    
    // Calculate estimated arrival time based on route duration
    const estimatedArrivalTime = addDays(departureDateTime, 0);
    estimatedArrivalTime.setMinutes(estimatedArrivalTime.getMinutes() + schedule.routes.estimated_duration);

    // Actualizar el horario
    const updatedSchedule = await prisma.schedules.update({
      where: { id: validatedData.id },
      data: {
        departure_date: departureDateTime,
        estimated_arrival_time: estimatedArrivalTime,
        price: validatedData.price,
        bus_id: validatedData.busId,
        primary_driver_id: validatedData.primaryDriverId,
        secondary_driver_id: validatedData.secondaryDriverId,
      },
    });

    // Si se asignó un bus, crear o actualizar la asignación
    if (validatedData.busId) {
      // Buscar asignación existente
      const existingAssignment = await prisma.bus_assignments.findFirst({
        where: {
          schedule_id: validatedData.id,
          status: "active",
        },
      });

      if (existingAssignment) {
        // Actualizar asignación existente
        await prisma.bus_assignments.update({
          where: { id: existingAssignment.id },
          data: {
            bus_id: validatedData.busId,
            status: "active",
            start_time: departureDateTime,
            end_time: estimatedArrivalTime,
          },
        });
      } else {
        // Crear nueva asignación
        await prisma.bus_assignments.create({
          data: {
            schedule_id: validatedData.id,
            bus_id: validatedData.busId,
            route_id: schedule.route_id,
            status: "active",
            start_time: departureDateTime,
            end_time: estimatedArrivalTime,
          },
        });
      }
    }

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error("Error updating schedule:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar el horario" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // Verify the schedule exists and check critical dependencies
    const existingSchedule = await prisma.schedules.findUnique({
      where: { id },
      include: {
        tickets: true,
        parcels: true,
      }
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check schedule status
    if (existingSchedule.status !== 'scheduled') {
      return NextResponse.json(
        { error: "Only scheduled trips can be deleted" },
        { status: 400 }
      );
    }

    // Solo verificar tickets y parcels activos
    const dependencies = {
      tickets: existingSchedule.tickets.some(ticket => ticket.status === 'active'),
      parcels: existingSchedule.parcels.some(parcel => 
        ['received', 'in_transit', 'ready_for_pickup'].includes(parcel.status || '')
      ),
    };

    if (Object.values(dependencies).some(Boolean)) {
      return NextResponse.json(
        { 
          error: "Cannot delete schedule with active tickets or parcels",
          details: {
            message: "El viaje tiene tickets o encomiendas activas que impiden su eliminación",
            dependencies: Object.entries(dependencies)
              .filter(([, hasRecords]) => hasRecords)
              .map(([type]) => type)
          }
        },
        { status: 400 }
      );
    }

    // Eliminar registros relacionados que no son críticos
    await prisma.$transaction([
      // Eliminar asignaciones de bus
      prisma.bus_assignments.deleteMany({
        where: { schedule_id: id }
      }),
      // Eliminar logs de bus
      prisma.bus_logs.deleteMany({
        where: { schedule_id: id }
      }),
      // Eliminar logs de ocupación
      prisma.occupancy_logs.deleteMany({
        where: { schedule_id: id }
      }),
      // Finalmente eliminar el schedule
      prisma.schedules.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({
      message: "Schedule and related records deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete schedule",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 