import { db } from "@/db";
import { pages } from "@/db/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const allPages = await db.select().from(pages);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-white">Pages</h1>
        <Link href="/admin/pages/new" className="admin-btn">
          New Page
        </Link>
      </div>

      <div className="admin-card p-0">
        <div className="grid grid-cols-[1fr_100px_60px] px-5 py-2.5 border-b border-[#222] text-xs text-[#666] uppercase tracking-wider">
          <span>Title</span>
          <span>Navigation</span>
          <span />
        </div>
        {allPages.map((page) => (
          <div
            key={page.slug}
            className="grid grid-cols-[1fr_100px_60px] px-5 py-3 border-b border-[#222] last:border-0 items-center hover:bg-[#1a1a1a] transition-colors"
          >
            <Link
              href={`/admin/pages/${page.slug}/edit`}
              className="text-sm text-[#ccc] hover:text-white"
            >
              {page.title}
            </Link>
            <span className="text-xs text-[#666]">{page.navigation}</span>
            <Link
              href={`/admin/pages/${page.slug}/edit`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Edit
            </Link>
          </div>
        ))}
        {allPages.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-[#666]">
            No pages yet.
          </div>
        )}
      </div>
    </div>
  );
}
