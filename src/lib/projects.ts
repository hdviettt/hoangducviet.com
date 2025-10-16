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
  status?: string; // Published status
  thumbnail?: string | {
    filename_disk: string;
    height: number;
    width: number;
  };
}

export async function getProjects(options?: ItemsQuery): Promise<Array<Project>> {
  return directus.request(readItems("projects", {
    ...options,
    filter: {
      ...options?.filter,
      status: {
        _eq: "published",
      },
    },
  })) as Promise<Array<Project>>;
}

export async function getProjectBySlug(
  slug: string,
  options?: ItemsQuery,
): Promise<Project> {
  // Use readItems with filter to check both slug and status
  const projects = await directus.request(readItems("projects", {
    ...options,
    filter: {
      ...options?.filter,
      slug: {
        _eq: slug,
      },
      status: {
        _eq: "published",
      },
    },
    limit: 1,
  })) as Project[];

  if (!projects || projects.length === 0) {
    throw new Error(`Project with slug "${slug}" not found or not published`);
  }

  return projects[0];
}