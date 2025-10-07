import { createDirectus, readItem, readItems, rest } from "@directus/sdk";

export interface ItemsQuery {
  limit?: number;
  fields?: Array<string>;
  filter?: Record<string, {
    _eq?: string | number;
    _in?: Array<string | number>;
  } | any>;
  sort?: Array<string>;
}

// Use hardcoded URL for Cloudflare Workers
const directusUrl = "https://directus-production-b969.up.railway.app";

export const directus = createDirectus(directusUrl).with(
  rest({
    onRequest: (options) => ({ ...options, cache: "no-store" }),
  }),
);

export async function getCollectionById(id: string, options?: ItemsQuery) {
  return directus.request(readItems(id, options));
}

export async function getItemById(
  collection: string,
  id: number | string,
  options?: ItemsQuery,
) {
  return directus.request(readItem(collection, id, options));
}

interface Home {
  id: number;
  featured_title: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cover: string | {
    filename_disk: string;
    height: number;
    width: number;
  };
  hero_buttons: Array<{
    label: string;
    link: string;
  }>;
  featured_posts: Array<number>;
}

export async function getHome() {
  return getCollectionById("home", {
    fields: [
      '*',
      "hero_cover.filename_disk",
      "hero_cover.height",
      "hero_cover.width",
    ]
  }) as unknown as Home;
}

interface GlobalMetadata {
  id: number;
  tagline: string;
  title: string;
}

export async function getGlobalMetadata() {
  return directus.request(readItems("global")) as unknown as GlobalMetadata[];
}

interface Hdviet {
  id: number;
  name?: string;
  description?: string;
  image?: string | {
    filename_disk: string;
    height: number;
    width: number;
  };
  [key: string]: any;
}

export async function getHdviet() {
  try {
    const result = await directus.request(readItems("hdviet", {
      fields: ['*', 'image.filename_disk', 'image.height', 'image.width'],
    }));
    return result as unknown as Hdviet[];
  } catch (error) {
    console.error("Error fetching Hdviet data:", error);
    return [];
  }
}

export async function getHdvietById(id: number | string) {
  try {
    const result = await directus.request(readItem("hdviet", id, {
      fields: ['*'],
    }));
    return result as unknown as Hdviet;
  } catch (error) {
    console.error("Error fetching Hdviet item:", error);
    return null;
  }
}
