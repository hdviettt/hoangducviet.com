import { db } from "@/db";
import { posts } from "@/db/schema";
import { getAnonId } from "@/lib/anon";
import { toggleLike } from "@/lib/likes";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

interface Params {
  params: { slug: string };
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const anonId = getAnonId();
    if (!anonId) {
      return NextResponse.json(
        { error: "Anonymous identity not set" },
        { status: 400 },
      );
    }

    const result = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, params.slug))
      .limit(1);

    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const state = await toggleLike(result[0].id, anonId);
    return NextResponse.json(state);
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
