import { db } from "@/db";
import { pages } from "@/db/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const allPages = await db.select().from(pages);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">pages</h1>
        <Link
          href="/admin/pages/new"
          className="text-sm bg-primary text-primary-foreground px-4 py-1.5 hover:opacity-90 transition-opacity"
        >
          + new page
        </Link>
      </div>

      <div className="border border-border divide-y divide-border">
        {allPages.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/pages/${page.slug}/edit`}
            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
          >
            <span className="text-sm flex-1">{page.title}</span>
            <span className="text-xs text-muted-foreground">{page.navigation === "yes" ? "in nav" : ""}</span>
          </Link>
        ))}
        {allPages.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">no pages yet.</div>
        )}
      </div>
    </div>
  );
}
