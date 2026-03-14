import { clearSessionCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
