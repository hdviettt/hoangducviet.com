import { db } from "@/db";
import { pages } from "@/db/schema";
import type { Block } from "@/types/fields";
import { and, eq } from "drizzle-orm";

export interface Page {
  slug?: string;
  title?: string;
  body?: {
    time: number;
    blocks: Array<Block>;
    version: string;
  };
  navigation?: string;
  dateCreated?: Date | null;
}

interface GetPagesOptions {
  navigation?: string;
}

export async function getPages(
  options?: GetPagesOptions,
): Promise<Array<Page>> {
  const conditions = [];
  if (options?.navigation) {
    conditions.push(eq(pages.navigation, options.navigation));
  }

  const result = conditions.length
    ? await db
        .select()
        .from(pages)
        .where(and(...conditions))
    : await db.select().from(pages);

  return result.map(mapPage);
}

export async function getPageBySlug(slug: string): Promise<Page> {
  if (!slug) throw new Error("Invalid slug");

  const result = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(`Page with slug "${slug}" not found`);
  }

  return mapPage(result[0]);
}

function mapPage(row: typeof pages.$inferSelect): Page {
  return {
    slug: row.slug,
    title: row.title,
    body: row.body as Page["body"],
    navigation: row.navigation ?? undefined,
    dateCreated: row.dateCreated,
  };
}
