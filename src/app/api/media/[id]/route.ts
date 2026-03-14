import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

const UPLOADS_DIR =
  process.env.UPLOADS_PATH || join(process.cwd(), "public/uploads");

interface Params {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAuth();

    // Batch delete: POST to /api/media/batch-delete
    if (params.id === "batch-delete") {
      const { ids } = await request.json();
      if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
      }
      const deleted = await db
        .delete(media)
        .where(inArray(media.id, ids))
        .returning();
      for (const item of deleted) {
        try {
          await unlink(join(UPLOADS_DIR, item.filename));
        } catch {}
      }
      return NextResponse.json({ deleted: deleted.length });
    }

    const id = Number.parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { originalName } = body;

    if (!originalName || typeof originalName !== "string") {
      return NextResponse.json({ error: "originalName required" }, { status: 400 });
    }

    const result = await db
      .update(media)
      .set({ originalName: originalName.trim() })
      .where(eq(media.id, id))
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

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAuth();

    const id = Number.parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await db.delete(media).where(eq(media.id, id)).returning();

    if (!result.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Try to delete the file
    try {
      await unlink(join(UPLOADS_DIR, result[0].filename));
    } catch {
      // File may already be deleted
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
