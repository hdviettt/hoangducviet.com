import { readItem, readItems } from "@directus/sdk";

import { type ItemsQuery, directus } from "@/lib/directus";
import type { Post } from "@/lib/posts";

export interface Project {
  slug: string; // slug is the primary key
  date_created?: string;
  date_updated?: string;
  posts?: Array<number | Post>;
  title?: string;
  description?: string;
  thumbnail?: string | {
    filename_disk: string;
    height: number;
    width: number;
  };
}

export async function getProjects(options?: ItemsQuery): Promise<Array<Project>> {
  return directus.request(readItems("projects", options));
}

export async function getProjectBySlug(
  slug: string,
  options?: ItemsQuery,
): Promise<Project> {
  // Since slug is now the primary key, we can use readItem directly
  return directus.request(readItem("projects", slug, options));
}