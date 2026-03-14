import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const authenticated = await getSession();
  if (!authenticated) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
