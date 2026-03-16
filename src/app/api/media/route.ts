import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
    const result = await db
      .select()
      .from(media)
      .orderBy(desc(media.uploadedAt));
    const withUrls = result.map((item) => ({
      ...item,
      url: `${R2_PUBLIC_URL}/${item.filename}`,
    }));
    return NextResponse.json(withUrls);
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

    // Upload to Cloudflare R2
    const url = await uploadToR2(filename, buffer, file.type);

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
        url,
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
