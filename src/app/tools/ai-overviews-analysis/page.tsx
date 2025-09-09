import { getToolBySlug } from "@/lib/get-tools";
import AIOverviewsAnalysisClient from "./client";

export default async function AIOverviewsAnalysisPage() {
  const tool = await getToolBySlug("ai-overviews-analysis");
  
  return <AIOverviewsAnalysisClient tool={tool} />;
}