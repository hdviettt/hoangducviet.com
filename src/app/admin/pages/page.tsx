import { db } from "@/db";
import { pages } from "@/db/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const allPages = await db.select().from(pages);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="bg-primary text-primary-foreground px-4 py-2 text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          New Page
        </Link>
      </div>

      <div className="border border-border">
        <div className="grid grid-cols-[1fr_100px_80px] px-4 py-2 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
          <span>Title</span>
          <span>Navigation</span>
          <span>Actions</span>
        </div>
        <div className="divide-y divide-border">
          {allPages.map((page) => (
            <div
              key={page.slug}
              className="grid grid-cols-[1fr_100px_80px] px-4 py-3 items-center"
            >
              <Link
                href={`/admin/pages/${page.slug}/edit`}
                className="text-sm hover:text-primary transition-colors"
              >
                {page.title}
              </Link>
              <span className="text-xs text-muted-foreground">
                {page.navigation}
              </span>
              <Link
                href={`/admin/pages/${page.slug}/edit`}
                className="text-xs text-primary hover:underline"
              >
                Edit
              </Link>
            </div>
          ))}
          {allPages.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No pages yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
