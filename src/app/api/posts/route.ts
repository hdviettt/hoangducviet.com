import { db } from "@/db";
import { posts, postsCategories, projectsPosts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.dateCreated));
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
      .insert(posts)
      .values({
        slug: body.slug,
        title: body.title,
        description: body.description || null,
        content: body.content || null,
        thumbnail: body.thumbnail || null,
        status: body.status || "draft",
      })
      .returning();

    const post = result[0];

    // Handle categories
    if (body.categories?.length) {
      await db.insert(postsCategories).values(
        body.categories.map((slug: string) => ({
          postId: post.id,
          categorySlug: slug,
        })),
      );
    }

    // Handle project association
    if (body.projectSlug) {
      await db.insert(projectsPosts).values({
        projectSlug: body.projectSlug,
        postSlug: post.slug,
      });
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
