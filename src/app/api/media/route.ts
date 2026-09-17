import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  UPLOAD_SLACK_BYTES,
} from "@/lib/upload-limits";
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

    // Guard against oversized uploads (videos especially) — reject up front,
    // before buffering the whole body into memory. Cloudflare also caps request
    // bodies, so keep this comfortably under that.
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_UPLOAD_BYTES + UPLOAD_SLACK_BYTES) {
      // Drain before answering. Replying while the client is still streaming
      // leaves a body nobody is reading: curl notices the early reply and
      // stops, but a browser's fetch() never settles, so the picker's button
      // sat on "Uploading…" indefinitely. Measured against production: a 55 MB
      // file hung for over five minutes; the same file through curl came back
      // 413 in two seconds. Draining costs no memory — the chunks are read and
      // dropped, never buffered — and it is what lets the client hear the 413.
      try {
        const body = request.body;
        if (body) {
          const reader = body.getReader();
          while (!(await reader.read()).done) {
            // discard
          }
        }
      } catch {
        // A client that gives up mid-stream is fine; the answer is the same.
      }
      return NextResponse.json(
        {
          error: `File too large. Maximum upload size is ${MAX_UPLOAD_LABEL}.`,
        },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: `File too large. Maximum upload size is ${MAX_UPLOAD_LABEL}.`,
        },
        { status: 413 },
      );
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
