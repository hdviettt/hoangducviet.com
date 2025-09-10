import { NextRequest, NextResponse } from "next/server";
import { analyzeData } from "@/lib/seo-analyzer/analyzer";
import type { BrandConfig } from "@/lib/seo-analyzer/types";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { brandName, brandDomain, data } = await request.json();

    if (!brandName || !brandDomain || !data) {
      return NextResponse.json(
        {
          error: "Missing required fields: brandName, brandDomain, data",
        },
        { status: 400 },
      );
    }

    const config: BrandConfig = {
      name: brandName,
      domain: brandDomain,
    };

    const results = await analyzeData(data, config);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        totalKeywords: results.keywords.length,
        aiOverviewCount: results.aiOverviews.length,
        competitorCount: results.competitors.length,
        brandMentions: results.brandMentions,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}