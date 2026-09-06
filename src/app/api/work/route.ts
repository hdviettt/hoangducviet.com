import { db } from "@/db";
import { projectPosts, projects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// Admin API for projects (the portfolio/Work content type). Distinct from
// /api/projects, which edits the `series` table for URL back-compat.

export async function GET() {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.sortOrder));
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

    // Khong con o nhap sort order: du an moi noi vao cuoi, roi keo len neu can.
    const last = await db
      .select({ max: sql<number>`coalesce(max(${projects.sortOrder}), 0)` })
      .from(projects);
    const nextOrder = Number(last[0]?.max ?? 0) + 1;

    const result = await db
      .insert(projects)
      .values({
        slug: body.slug,
        title: body.title,
        description: body.description || null,
        content: body.content || null,
        thumbnail: body.thumbnail || null,
        repoUrl: body.repoUrl || null,
        liveUrl: body.liveUrl || null,
        parentSlug: body.parentSlug || null,
        features: body.features ?? [],
        stack: body.stack ?? [],
        models: body.models ?? [],
        media: body.media ?? [],
        metrics: body.metrics ?? [],
        status: body.status || "draft",
        buildStatus: body.buildStatus || "live",
        featured: !!body.featured,
        sortOrder: Number(body.sortOrder) || nextOrder,
      })
      .returning();

    const created = result[0];

    if (body.postSlugs?.length) {
      await db.insert(projectPosts).values(
        body.postSlugs.map((postSlug: string) => ({
          projectSlug: created.slug,
          postSlug,
        })),
      );
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
