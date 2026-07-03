import { db } from "@/db";
import { projectPosts, projects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { asc, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Admin API for the `projects` table (public URL is /projects; admin path is
// /admin/work + /api/work because /admin/projects manages `series`).

export async function GET() {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(projects)
      .orderBy(
        desc(projects.featured),
        asc(projects.sortOrder),
        desc(projects.dateCreated),
      );
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
      .insert(projects)
      .values({
        slug: body.slug,
        title: body.title,
        tagline: body.tagline || null,
        content: body.content || null,
        thumbnail: body.thumbnail || null,
        repoUrl: body.repoUrl || null,
        liveUrl: body.liveUrl || null,
        techTags: body.techTags?.length ? body.techTags : null,
        status: body.status || "draft",
        buildStatus: body.buildStatus || "live",
        featured: !!body.featured,
        sortOrder: Number(body.sortOrder) || 0,
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
