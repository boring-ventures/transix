import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

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
    }
  } catch (error) {
    return NextResponse.json({ 
      error: "Ha ocurrido un error", 
      details: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 });
  }
}

// Nuevo método POST para registrar un cliente
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentId, full_name, phone, email } = body;

    // Validación mínima: asegurarse de tener los campos requeridos
    if (!documentId || !full_name) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: documentId y full_name" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cliente con ese documento
    const existingCustomer = await prisma.customers.findUnique({
      where: { document_id: documentId },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Ya existe un cliente con ese número de documento" },
        { status: 409 }
      );
    }

    const newCustomer = await prisma.customers.create({
      data: {
        document_id: documentId,
        full_name,
        phone: phone || null,
        email: email || null,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    
    // Manejar error específico de documento duplicado
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Ya existe un cliente con ese número de documento" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al registrar el cliente", details: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
} 