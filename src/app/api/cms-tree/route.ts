import { db } from "@/db";
import { cmsFolders, cmsItemPlacement } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Folders and item placement for the admin navigation panel.
 *
 * One route with an `action` rather than a file per verb: these are six small
 * mutations against two tables that only the panel ever calls, and splitting
 * them across five route files would be more surface than the feature has.
 *
 * None of this reaches the public site. The reader-facing routes, the feed,
 * the sitemap and the JSON-LD builders do not read either table.
 */

const SCOPES = new Set(["posts", "work", "series"]);

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET(request: Request) {
  try {
    await requireAuth();
    const scope = new URL(request.url).searchParams.get("scope") ?? "";
    if (!SCOPES.has(scope)) return bad("Unknown scope");

    const [folders, placement] = await Promise.all([
      db
        .select()
        .from(cmsFolders)
        .where(eq(cmsFolders.scope, scope))
        .orderBy(cmsFolders.sortOrder, cmsFolders.name),
      db
        .select()
        .from(cmsItemPlacement)
        .where(eq(cmsItemPlacement.scope, scope)),
    ]);
    return NextResponse.json({ folders, placement });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * Would moving `id` under `parentId` put a folder inside itself? Walking up
 * from the proposed parent is enough: a cycle can only form if `id` is already
 * an ancestor of it.
 */
async function wouldCycle(id: number, parentId: number | null) {
  let cursor = parentId;
  const seen = new Set<number>();
  while (cursor != null) {
    if (cursor === id) return true;
    if (seen.has(cursor)) return true;
    seen.add(cursor);
    const row = await db
      .select({ parentId: cmsFolders.parentId })
      .from(cmsFolders)
      .where(eq(cmsFolders.id, cursor))
      .limit(1);
    if (!row.length) return false;
    cursor = row[0].parentId ?? null;
  }
  return false;
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = await request.json();
    const action = String(body.action ?? "");

    if (action === "createFolder") {
      const scope = String(body.scope ?? "");
      if (!SCOPES.has(scope)) return bad("Unknown scope");
      const name = String(body.name ?? "").trim() || "New folder";
      const parentId =
        body.parentId === null || body.parentId === undefined
          ? null
          : Number(body.parentId);
      if (parentId !== null && !Number.isInteger(parentId)) {
        return bad("Bad parentId");
      }
      const [row] = await db
        .insert(cmsFolders)
        .values({
          scope,
          name,
          parentId,
          sortOrder: Number(body.sortOrder ?? 0),
        })
        .returning();
      return NextResponse.json(row);
    }

    if (action === "renameFolder") {
      const id = Number(body.id);
      const name = String(body.name ?? "").trim();
      if (!Number.isInteger(id) || !name) return bad("Bad id or name");
      const [row] = await db
        .update(cmsFolders)
        .set({ name })
        .where(eq(cmsFolders.id, id))
        .returning();
      if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(row);
    }

    if (action === "deleteFolder") {
      const id = Number(body.id);
      if (!Number.isInteger(id)) return bad("Bad id");
      // The subtree goes with it (ON DELETE CASCADE) and any item inside is
      // unfiled rather than deleted (ON DELETE SET NULL). Deleting a folder
      // must never be a way to lose a post.
      await db.delete(cmsFolders).where(eq(cmsFolders.id, id));
      return NextResponse.json({ ok: true });
    }

    if (action === "moveFolder") {
      const id = Number(body.id);
      if (!Number.isInteger(id)) return bad("Bad id");
      const parentId =
        body.parentId === null || body.parentId === undefined
          ? null
          : Number(body.parentId);
      if (parentId !== null && !Number.isInteger(parentId)) {
        return bad("Bad parentId");
      }
      if (parentId !== null && (await wouldCycle(id, parentId))) {
        return bad("A folder cannot be moved inside itself");
      }
      const [row] = await db
        .update(cmsFolders)
        .set({ parentId, sortOrder: Number(body.sortOrder ?? 0) })
        .where(eq(cmsFolders.id, id))
        .returning();
      if (!row)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(row);
    }

    if (action === "moveItem") {
      const scope = String(body.scope ?? "");
      const slug = String(body.slug ?? "");
      if (!SCOPES.has(scope) || !slug) return bad("Bad scope or slug");
      const folderId =
        body.folderId === null || body.folderId === undefined
          ? null
          : Number(body.folderId);
      if (folderId !== null && !Number.isInteger(folderId)) {
        return bad("Bad folderId");
      }
      const sortOrder = Number(body.sortOrder ?? 0);
      await db
        .insert(cmsItemPlacement)
        .values({ scope, itemSlug: slug, folderId, sortOrder })
        .onConflictDoUpdate({
          target: [cmsItemPlacement.scope, cmsItemPlacement.itemSlug],
          set: { folderId, sortOrder },
        });
      return NextResponse.json({ ok: true });
    }

    if (action === "reorder") {
      // A whole sibling list at once, so a drop that shifts ten rows is one
      // request and one transaction rather than ten racing ones.
      const scope = String(body.scope ?? "");
      if (!SCOPES.has(scope)) return bad("Unknown scope");
      const folders: Array<{ id: number; sortOrder: number }> =
        body.folders ?? [];
      const items: Array<{ slug: string; sortOrder: number }> =
        body.items ?? [];
      const folderId =
        body.folderId === null || body.folderId === undefined
          ? null
          : Number(body.folderId);

      await db.transaction(async (tx) => {
        for (const f of folders) {
          if (!Number.isInteger(Number(f.id))) continue;
          await tx
            .update(cmsFolders)
            .set({ sortOrder: Number(f.sortOrder) })
            .where(eq(cmsFolders.id, Number(f.id)));
        }
        for (const i of items) {
          if (!i.slug) continue;
          await tx
            .insert(cmsItemPlacement)
            .values({
              scope,
              itemSlug: String(i.slug),
              folderId,
              sortOrder: Number(i.sortOrder),
            })
            .onConflictDoUpdate({
              target: [cmsItemPlacement.scope, cmsItemPlacement.itemSlug],
              set: { folderId, sortOrder: Number(i.sortOrder) },
            });
        }
      });
      return NextResponse.json({ ok: true });
    }

    return bad("Unknown action");
  } catch (error) {
    if ((error as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
