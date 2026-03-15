import { db } from "@/db";
import { projectGroups } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(projectGroups)
      .orderBy(asc(projectGroups.sortOrder), asc(projectGroups.title));
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();

    const slug = body.slug
      || body.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

    const result = await db
      .insert(projectGroups)
      .values({
        slug,
        title: body.title,
        sortOrder: body.sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating project group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
