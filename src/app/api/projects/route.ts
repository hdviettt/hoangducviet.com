import { db } from "@/db";
import { projects, projectsPosts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.dateCreated));
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
        description: body.description || null,
        thumbnail: body.thumbnail || null,
        status: body.status || "draft",
      })
      .returning();

    const project = result[0];

    // Handle related posts
    if (body.postSlugs?.length) {
      await db.insert(projectsPosts).values(
        body.postSlugs.map((postSlug: string) => ({
          projectSlug: project.slug,
          postSlug,
        })),
      );
    }

    return NextResponse.json(project, { status: 201 });
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
