import { db } from "@/db";
import { global, profile } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const [globalData, profileData] = await Promise.all([
      db.select().from(global).limit(1),
      db.select().from(profile).limit(1),
    ]);

    return NextResponse.json({
      global: globalData[0] || null,
      profile: profileData[0] || null,
    });
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

export async function PUT(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();

    if (body.global) {
      await db
        .update(global)
        .set({
          title: body.global.title,
          tagline: body.global.tagline,
        })
        .where(eq(global.id, 1));
    }

    if (body.profile) {
      await db
        .update(profile)
        .set({
          name: body.profile.name,
          description: body.profile.description,
          image: body.profile.image,
          headline: body.profile.headline,
          aboutHtml: body.profile.aboutHtml,
        })
        .where(eq(profile.id, 1));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
