import { db } from "@/db";
import { series, seriesPosts } from "@/db/schema";
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
      .from(series)
      .where(eq(series.slug, params.slug))
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
      .update(series)
      .set({ status: body.status, dateUpdated: new Date() })
      .where(eq(series.slug, params.slug))
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
      .update(series)
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
      .where(eq(series.slug, params.slug))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = result[0];

    await db
      .delete(seriesPosts)
      .where(eq(seriesPosts.seriesSlug, updated.slug));

    if (body.postSlugs?.length) {
      await db.insert(seriesPosts).values(
        body.postSlugs.map((postSlug: string) => ({
          seriesSlug: updated.slug,
          postSlug,
        })),
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating series:", error);
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
      .delete(series)
      .where(eq(series.slug, params.slug))
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
