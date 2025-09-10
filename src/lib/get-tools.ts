import { readItems } from "@directus/sdk";
import { directus } from "./directus";
import type { Tool } from "@/types/tools";

// Helper function to strip HTML tags from description
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function getTools(): Promise<Tool[]> {
  try {
    const tools = await directus.request(
      readItems("tools", {
        fields: ["name", "description", "slug", "status"],
        sort: ["status", "name"],
      })
    );
    // Clean HTML from descriptions and add a temporary id based on slug
    return (tools as any[]).map((tool, index) => ({
      id: tool.slug || String(index), // Use slug as id since id field is not accessible
      name: tool.name,
      description: stripHtml(tool.description || ''),
      slug: tool.slug,
      status: tool.status
    }));
  } catch (error) {
    console.error("Error fetching tools:", error);
    return [];
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  try {
    const tools = await directus.request(
      readItems("tools", {
        fields: ["name", "description", "slug", "status", "password"],
        filter: {
          slug: {
            _eq: slug,
          },
        },
        limit: 1,
      })
    );
    const tool = tools[0] as any;
    return tool ? {
      id: tool.slug, // Use slug as id
      name: tool.name,
      description: stripHtml(tool.description || ''),
      slug: tool.slug,
      status: tool.status,
      password: tool.password
    } : null;
  } catch (error) {
    console.error(`Error fetching tool with slug ${slug}:`, error);
    return null;
  }
}

export async function getPublishedTools(): Promise<Tool[]> {
  try {
    const tools = await directus.request(
      readItems("tools", {
        fields: ["name", "description", "slug", "status"],
        filter: {
          status: {
            _eq: "published",
          },
        },
        sort: ["name"],
      })
    );
    // Clean HTML from descriptions and add a temporary id
    return (tools as any[]).map((tool, index) => ({
      id: tool.slug || String(index),
      name: tool.name,
      description: stripHtml(tool.description || ''),
      slug: tool.slug,
      status: tool.status
    }));
  } catch (error) {
    console.error("Error fetching published tools:", error);
    return [];
  }
}