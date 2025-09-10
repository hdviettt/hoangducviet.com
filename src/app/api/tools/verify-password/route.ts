import { NextRequest, NextResponse } from "next/server";
import { readItems } from "@directus/sdk";
import { directus } from "@/lib/directus";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { toolSlug, password } = await request.json();

    if (!toolSlug || !password) {
      return NextResponse.json(
        { error: "Tool slug and password are required" },
        { status: 400 }
      );
    }

    // Check if tool exists in Directus (for validation)
    const tools = await directus.request(
      readItems("tools", {
        fields: ["slug"],
        filter: {
          slug: { _eq: toolSlug },
        },
        limit: 1,
      })
    );

    const tool = tools[0] as any;
    
    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Get password from environment variable
    const envPasswordKey = `TOOL_PASSWORD_${toolSlug.toUpperCase().replace(/-/g, '_')}`;
    const toolPassword = process.env[envPasswordKey];

    if (!toolPassword) {
      // Tool has no password protection
      return NextResponse.json({ valid: true });
    }

    console.log("Password verification debug:");
    console.log("- Tool slug:", toolSlug);
    // Don't log passwords in production
    // console.log("- Input password:", password);
    // console.log("- Stored hash:", tool.password);

    // Edge Runtime doesn't support native argon2, so we'll use a workaround
    // We'll verify by making a test request to Directus API
    
    let isValid = false;

    try {
      // Simple password comparison with environment variable
      isValid = password === toolPassword;
      console.log("- Password verification completed");

    } catch (error) {
      console.error("- Password verification error:", error);
      isValid = false;
    }

    console.log("- Final validation result:", isValid);

    return NextResponse.json({ valid: isValid });
    
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { error: "Password verification failed" },
      { status: 500 }
    );
  }
}