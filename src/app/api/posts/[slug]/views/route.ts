import { getPostViewCount } from "@/lib/posthog-server";
import { NextResponse } from "next/server";

interface Params {
  params: { slug: string };
}

export async function GET(_request: Request, { params }: Params) {
  const count = await getPostViewCount(params.slug);
  return NextResponse.json({ count });
}
