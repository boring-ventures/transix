import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scheduleId = searchParams.get('scheduleId');

  if (!scheduleId) {
    return new Response('Schedule ID is required', { status: 400 });
  }

  try {
    const tickets = await prisma.tickets.findMany({
      where: {
        schedule_id: scheduleId,
        status: 'active'
      },
      select: {
        bus_seat_id: true
      }
    });

    return new Response(JSON.stringify(tickets));
  } catch {
    return new Response('Error fetching tickets', { status: 500 });
  }
} 