import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

const UPLOADS_DIR =
  process.env.UPLOADS_PATH || join(process.cwd(), "public/uploads");

export async function GET() {
  try {
    await requireAuth();
    const result = await db
      .select()
      .from(media)
      .orderBy(desc(media.uploadedAt));
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and add timestamp
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${sanitized}`;

    // Ensure uploads directory exists
    await mkdir(UPLOADS_DIR, { recursive: true });

    const filepath = join(UPLOADS_DIR, filename);
    await writeFile(filepath, buffer);

    const result = await db
      .insert(media)
      .values({
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: buffer.length,
      })
      .returning();

    return NextResponse.json(
      {
        ...result[0],
        url: `/uploads/${filename}`,
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
