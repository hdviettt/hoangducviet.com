import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const UPLOADS_DIR =
  process.env.UPLOADS_PATH || join(process.cwd(), "public/uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

export async function GET(
  _request: Request,
  { params }: { params: { path: string[] } },
) {
  const filename = params.path.join("/");

  // Prevent path traversal
  if (filename.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filepath = join(UPLOADS_DIR, filename);

  try {
    await stat(filepath);
    const buffer = await readFile(filepath);
    const ext = "." + filename.split(".").pop()?.toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
