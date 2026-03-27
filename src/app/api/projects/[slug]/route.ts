import { db } from "@/db";
import { projects, projectsPosts } from "@/db/schema";
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
        url: body.url ?? null,
        summary: body.summary ?? null,
        description: body.description ?? null,
        thumbnail: body.thumbnail ?? null,
        status: body.status,
        groupSlug: body.groupSlug ?? null,
        dateUpdated: new Date(),
      })
      .where(eq(projects.slug, params.slug))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const project = result[0];

    // Update related posts
    await db
      .delete(projectsPosts)
      .where(eq(projectsPosts.projectSlug, project.slug));

    if (body.postSlugs?.length) {
      await db.insert(projectsPosts).values(
        body.postSlugs.map((postSlug: string) => ({
          projectSlug: project.slug,
          postSlug,
        })),
      );
    }

    return NextResponse.json(project);
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
