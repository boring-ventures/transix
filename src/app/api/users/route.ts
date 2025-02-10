import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, profiles, companies } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { insertUserSchema, insertProfileSchema } from "@/types/user.types";
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          created_at: users.created_at,
          updated_at: users.updated_at,
          profile: {
            id: profiles.id,
            fullName: profiles.fullName,
            role: profiles.role,
            active: profiles.active,
            companyId: profiles.companyId,
            branchId: profiles.branchId,
            createdAt: profiles.createdAt,
            updatedAt: profiles.updatedAt,
          },
          company: {
            id: companies.id,
            name: companies.name,
            active: companies.active,
            createdAt: companies.createdAt,
            updatedAt: companies.updatedAt,
          },
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .leftJoin(companies, eq(profiles.companyId, companies.id))
        .where(and(eq(users.id, userId), eq(profiles.active, true)))
        .limit(1);

      return NextResponse.json(result[0]);
    }

    const results = await db
      .select({
        id: users.id,
        email: users.email,
        created_at: users.created_at,
        updated_at: users.updated_at,
        profile: {
          id: profiles.id,
          fullName: profiles.fullName,
          role: profiles.role,
          active: profiles.active,
          companyId: profiles.companyId,
          branchId: profiles.branchId,
          createdAt: profiles.createdAt,
          updatedAt: profiles.updatedAt,
        },
        company: {
          id: companies.id,
          name: companies.name,
          active: companies.active,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .leftJoin(companies, eq(profiles.companyId, companies.id))
      .where(eq(profiles.active, true));

    return NextResponse.json(results);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const userData = insertUserSchema.parse(body.user);
    const profileData = insertProfileSchema.parse(body.profile);

    const [currentProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, currentUser.id))
      .limit(1);

    if (currentProfile && currentProfile.role === "company_admin") {
      if (!currentProfile.companyId) {
        return NextResponse.json(
          { error: "Tu perfil no tiene una compañía asociada." },
          { status: 400 }
        );
      }
      profileData.companyId = currentProfile.companyId;
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || "Failed to create user" },
        { status: 400 }
      );
    }

    const [profile] = await db
      .insert(profiles)
      .values({
        userId: authUser.user.id,
        fullName: profileData.fullName,
        role: profileData.role,
        companyId: profileData.companyId,
        branchId: profileData.branchId,
        active: profileData.active,
      })
      .returning();

    return NextResponse.json({ user: authUser.user, profile }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}