import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSeasonSchema = z.object({
  seasonStart: z.string(),
  seasonEnd: z.string(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const validatedData = updateSeasonSchema.parse(body);

    const routeSchedule = await prisma.route_schedules.update({
      where: { id },
      data: {
        season_start: new Date(validatedData.seasonStart),
        season_end: new Date(validatedData.seasonEnd),
      },
    });

    return NextResponse.json({
      id: routeSchedule.id,
      seasonStart: routeSchedule.season_start,
      seasonEnd: routeSchedule.season_end,
    });
  } catch (error) {
    console.error("Error updating route schedule season:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar las fechas de temporada" },
      { status: 500 }
    );
  }
} 