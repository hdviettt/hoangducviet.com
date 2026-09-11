import { db } from "@/db";
import { projectPosts, projects, projectsCategories } from "@/db/schema";
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
        description: body.description ?? null,
        content: body.content ?? null,
        thumbnail: body.thumbnail ?? null,
        stack: body.stack ?? [],
        models: body.models ?? [],
        media: body.media ?? [],
        status: body.status,
        buildStatus: body.buildStatus,
        featured: !!body.featured,
        ...(body.sortOrder === undefined
          ? {}
          : { sortOrder: Number(body.sortOrder) || 0 }),
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

    // Tags are replaced only when the request actually carries them. An
    // unconditional delete-then-insert means any caller that omits the field
    // silently strips every tag off the project, which is a data loss that
    // looks exactly like a successful save.
    if (Array.isArray(body.categories)) {
      await db
        .delete(projectsCategories)
        .where(eq(projectsCategories.projectSlug, updated.slug));
      if (body.categories.length) {
        await db.insert(projectsCategories).values(
          body.categories.map((categorySlug: string) => ({
            projectSlug: updated.slug,
            categorySlug,
          })),
        );
      }
    }

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
