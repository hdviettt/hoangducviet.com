import { db } from "@/db";
import { projectPosts, projects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface Params {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, params.slug))
      .limit(1);
    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Status toggle (published/draft) from the admin list.
export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAuth();
    const body = await request.json();
    const result = await db
      .update(projects)
      .set({ status: body.status, dateUpdated: new Date() })
      .where(eq(projects.slug, params.slug))
      .returning();
    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await requireAuth();
    const body = await request.json();

    const result = await db
      .update(projects)
      .set({
        title: body.title,
        slug: body.slug,
        tagline: body.tagline ?? null,
        description: body.description ?? null,
        content: body.content ?? null,
        thumbnail: body.thumbnail ?? null,
        parentSlug: body.parentSlug ?? null,
        stack: body.stack ?? [],
        models: body.models ?? [],
        media: body.media ?? [],
        status: body.status,
        buildStatus: body.buildStatus,
        featured: !!body.featured,
        sortOrder: Number(body.sortOrder) || 0,
        dateUpdated: new Date(),
      })
      .where(eq(projects.slug, params.slug))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = result[0];

    await db
      .delete(projectPosts)
      .where(eq(projectPosts.projectSlug, updated.slug));

    if (body.postSlugs?.length) {
      await db.insert(projectPosts).values(
        body.postSlugs.map((postSlug: string) => ({
          projectSlug: updated.slug,
          postSlug,
        })),
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAuth();
    const result = await db
      .delete(projects)
      .where(eq(projects.slug, params.slug))
      .returning();
    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
