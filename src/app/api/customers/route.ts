import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return NextResponse.json({ error: "El parámetro documentId es requerido" }, { status: 400 });
  }

  try {
    // Se consulta la base de datos utilizando Prisma
    const customer = await prisma.customers.findUnique({
      where: { document_id: documentId },
    });

    if (customer) {
      return NextResponse.json(customer);
    } else {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "Ha ocurrido un error", details: error.message }, { status: 500 });
  }
} 