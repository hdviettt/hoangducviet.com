import { db } from "@/db";
import { series, seriesPosts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Admin API for series records (URL kept at /api/projects for admin-form
// backward compat — the underlying table is `series` after the rename).

export async function GET() {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(series)
      .orderBy(desc(series.dateCreated));
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

    const result = await db
      .insert(series)
      .values({
        slug: body.slug,
        title: body.title,
        url: body.url || null,
        summary: body.summary || null,
        description: body.description || null,
        thumbnail: body.thumbnail || null,
        status: body.status || "draft",
        groupSlug: body.groupSlug || null,
      })
      .returning();

    const created = result[0];

    if (body.postSlugs?.length) {
      await db.insert(seriesPosts).values(
        body.postSlugs.map((postSlug: string) => ({
          seriesSlug: created.slug,
          postSlug,
        })),
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating series:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
