import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const UPLOADS_DIR =
  process.env.UPLOADS_PATH || join(process.cwd(), "public/uploads");

interface Params {
  params: { id: string };
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
