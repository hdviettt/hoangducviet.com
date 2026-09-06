import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Reorder the whole Work list in one request.
//
// The alternative was what the CMS used to make you do: open a project, type a
// new sort number, save, then open every project the change displaced and fix
// its number too. Order is a property of the list, not of one row, so it is
// edited as a list: the client sends the slugs in their new order and every
// row gets its position written in one transaction.
export async function PATCH(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const slugs: unknown = body?.slugs;

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json({ error: "slugs required" }, { status: 400 });
    }
    if (!slugs.every((s) => typeof s === "string" && s.length > 0)) {
      return NextResponse.json({ error: "bad slugs" }, { status: 400 });
    }
    if (new Set(slugs).size !== slugs.length) {
      return NextResponse.json({ error: "duplicate slugs" }, { status: 400 });
    }

    // One transaction: a half-applied order is worse than no change, because
    // two rows would then share a position and the list would sort by the
    // tiebreaker instead.
    await db.transaction(async (tx) => {
      for (let i = 0; i < slugs.length; i++) {
        await tx
          .update(projects)
          .set({ sortOrder: i + 1 })
          .where(eq(projects.slug, slugs[i] as string));
      }
    });

    return NextResponse.json({ ok: true, count: slugs.length });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("work reorder failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
