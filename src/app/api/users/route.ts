import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from '@supabase/supabase-js';
import { insertUserSchema, insertProfileSchema } from "@/types/user.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (userId) {
      const profile = await prisma.profiles.findFirst({
        where: { user_id: userId },
        include: {
          companies: true,
        },
      });

      if (!profile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const formattedUser = {
        id: profile.user_id,
        email: profile.email,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        profile: {
          id: profile.id,
          fullName: profile.full_name,
          role: profile.role,
          active: profile.active,
          companyId: profile.company_id,
          branchId: profile.branch_id,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          company: profile.companies
            ? {
                id: profile.companies.id,
                name: profile.companies.name,
                active: profile.companies.active,
                createdAt: profile.companies.created_at,
                updatedAt: profile.companies.updated_at,
              }
            : null,
        },
      };

      return NextResponse.json(formattedUser);
    }
    
    const profiles = await prisma.profiles.findMany({
      where: {
        active: true,
      },
      include: {
        companies: true,
      },
    });

    const formattedUsers = profiles.map((profile) => ({
      id: profile.user_id,
      email: profile.email,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        role: profile.role,
        active: profile.active,
        companyId: profile.company_id,
        branchId: profile.branch_id,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        company: profile.companies
          ? {
              id: profile.companies.id,
              name: profile.companies.name,
              active: profile.companies.active,
              createdAt: profile.companies.created_at,
              updatedAt: profile.companies.updated_at,
            }
          : null,
      },
    }));
    return NextResponse.json(formattedUsers);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/users received");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const body = await request.json();
    console.log("Body recibido:", body);
    const userData = insertUserSchema.parse(body.user);
    const profileData = insertProfileSchema.parse(body.profile);
    console.log("Datos validados:", userData, profileData);

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      });
    console.log("Resultado supabase.auth.admin.createUser:", authUser, authError);

    if (authError) {
      return NextResponse.json(
        { error: authError.message || "Failed to create user" },
        { status: 400 }
      );
    }

    const profile = await prisma.profiles.create({
      data: {
        user_id: authUser.user.id,
        full_name: profileData.fullName,
        role: profileData.role,
        company_id: profileData.companyId,
        branch_id: profileData.branchId,
        active: profileData.active,
      },
    });
    console.log("Perfil creado:", profile);

    return NextResponse.json(
      { user: authUser.user, profile },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error en POST /api/users:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}