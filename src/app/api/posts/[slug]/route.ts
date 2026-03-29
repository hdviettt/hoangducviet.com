import { db } from "@/db";
import { posts, postsCategories, projectsPosts } from "@/db/schema";
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
      .from(posts)
      .where(eq(posts.slug, params.slug))
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
      .update(posts)
      .set({ status: body.status, dateUpdated: new Date() })
      .where(eq(posts.slug, params.slug))
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
      .update(posts)
      .set({
        title: body.title,
        slug: body.slug,
        description: body.description ?? null,
        content: body.content ?? null,
        thumbnail: body.thumbnail ?? null,
        status: body.status,
        dateUpdated: new Date(),
      })
      .where(eq(posts.slug, params.slug))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const post = result[0];

    // Update categories: delete old, insert new
    await db.delete(postsCategories).where(eq(postsCategories.postId, post.id));

    if (body.categories?.length) {
      await db.insert(postsCategories).values(
        body.categories.map((slug: string) => ({
          postId: post.id,
          categorySlug: slug,
        })),
      );
    }

    // Update project association: delete old, insert new
    await db.delete(projectsPosts).where(eq(projectsPosts.postSlug, post.slug));

    if (body.projectSlug) {
      await db.insert(projectsPosts).values({
        projectSlug: body.projectSlug,
        postSlug: post.slug,
      });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating post:", error);
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
      .delete(posts)
      .where(eq(posts.slug, params.slug))
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
