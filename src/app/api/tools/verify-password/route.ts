import { NextRequest, NextResponse } from "next/server";
import { readItems } from "@directus/sdk";
import { directus } from "@/lib/directus";
import argon2 from "argon2";

export async function POST(request: NextRequest) {
  try {
    const { toolSlug, password } = await request.json();

    if (!toolSlug || !password) {
      return NextResponse.json(
        { error: "Tool slug and password are required" },
        { status: 400 }
      );
    }

    // Fetch the tool with its hashed password
    const tools = await directus.request(
      readItems("tools", {
        fields: ["password"],
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

    if (!tool.password) {
      // Tool has no password protection
      return NextResponse.json({ valid: true });
    }

    console.log("Password verification debug:");
    console.log("- Tool slug:", toolSlug);
    console.log("- Input password:", password);
    console.log("- Stored hash:", tool.password);
    console.log("- Hash length:", tool.password.length);

    // Check if it's an Argon2 hash (should start with $argon2)
    const isArgon2Hash = tool.password.startsWith('$argon2');
    console.log("- Is Argon2 format:", isArgon2Hash);

    let isValid = false;

    if (isArgon2Hash) {
      try {
        // It's an Argon2 hash (Directus default)
        isValid = await argon2.verify(tool.password, password);
        console.log("- Argon2 verification result:", isValid);
      } catch (error) {
        console.error("- Argon2 verification error:", error);
        isValid = false;
      }
    } else {
      // Fallback to direct comparison for plain text
      isValid = password === tool.password;
      console.log("- Direct comparison result:", isValid);
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