import { db } from "@/db";
import { posts, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FileText, FolderKanban, AlertTriangle, Link2, Unlink } from "lucide-react";
import Link from "next/link";
import LinkTable from "./LinkTable";

export const dynamic = "force-dynamic";

type PageNode = {
  type: "post" | "project";
  slug: string;
  title: string;
  path: string;
};

type LinkEdge = {
  sourcePath: string;
  targetPath: string;
};

function extractLinksFromMarkdown(content: string): string[] {
  const links: string[] = [];
  // Markdown links: [text](/posts/slug) or [text](/projects/slug)
  const mdLinkRegex = /\]\(\s*\/(posts|projects)\/([^\s)#"]+)/g;
  let match: RegExpExecArray | null;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    links.push(`/${match[1]}/${match[2]}`);
  }
  // Bare URLs in markdown: href="/posts/slug" or src="/posts/slug"
  const hrefRegex = /(?:href|src)=["']\/(posts|projects)\/([^\s"'#]+)/g;
  while ((match = hrefRegex.exec(content)) !== null) {
    links.push(`/${match[1]}/${match[2]}`);
  }
  return links;
}

function extractLinksFromHtml(content: string): string[] {
  const links: string[] = [];
  const hrefRegex = /href=["']\/(posts|projects)\/([^\s"'#]+)/g;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(content)) !== null) {
    links.push(`/${match[1]}/${match[2]}`);
  }
  return links;
}

export default async function InternalLinksPage() {
  const [allPosts, allProjects] = await Promise.all([
    db
      .select({ slug: posts.slug, title: posts.title, content: posts.content })
      .from(posts)
      .where(eq(posts.status, "published")),
    db
      .select({
        slug: projects.slug,
        title: projects.title,
        description: projects.description,
      })
      .from(projects)
      .where(eq(projects.status, "published")),
  ]);

  // Build page map
  const pages = new Map<string, PageNode>();
  for (const post of allPosts) {
    const path = `/posts/${post.slug}`;
    pages.set(path, { type: "post", slug: post.slug, title: post.title, path });
  }
  for (const project of allProjects) {
    const path = `/projects/${project.slug}`;
    pages.set(path, {
      type: "project",
      slug: project.slug,
      title: project.title,
      path,
    });
  }

  // Extract all links
  const edges: LinkEdge[] = [];
  for (const post of allPosts) {
    if (!post.content) continue;
    const links = extractLinksFromMarkdown(post.content);
    for (const target of links) {
      edges.push({ sourcePath: `/posts/${post.slug}`, targetPath: target });
    }
  }
  for (const project of allProjects) {
    if (!project.description) continue;
    const links = extractLinksFromHtml(project.description);
    for (const target of links) {
      edges.push({
        sourcePath: `/projects/${project.slug}`,
        targetPath: target,
      });
    }
  }

  // Deduplicate edges (same source->target)
  const uniqueEdges = Array.from(
    new Map(edges.map((e) => [`${e.sourcePath}->${e.targetPath}`, e])).values(),
  );

  // Build incoming/outgoing maps
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();
  for (const edge of uniqueEdges) {
    if (!outgoing.has(edge.sourcePath)) outgoing.set(edge.sourcePath, []);
    outgoing.get(edge.sourcePath)!.push(edge.targetPath);

    if (!incoming.has(edge.targetPath)) incoming.set(edge.targetPath, []);
    incoming.get(edge.targetPath)!.push(edge.sourcePath);
  }

  // Orphan pages (no incoming links)
  const orphanPages = Array.from(pages.values()).filter(
    (page) => !incoming.has(page.path) || incoming.get(page.path)!.length === 0,
  );

  // Broken links (target doesn't exist)
  const brokenLinks = uniqueEdges.filter((edge) => !pages.has(edge.targetPath));

  // Build table data
  const tableData = Array.from(pages.values()).map((page) => ({
    type: page.type,
    slug: page.slug,
    title: page.title,
    path: page.path,
    incomingCount: incoming.get(page.path)?.length ?? 0,
    outgoingCount: outgoing.get(page.path)?.length ?? 0,
    incomingSources: incoming.get(page.path) ?? [],
    outgoingTargets: outgoing.get(page.path) ?? [],
  }));

  const totalLinks = uniqueEdges.length;

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-medium mb-6">internal links</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "pages",
            value: pages.size,
            icon: FileText,
            color: "text-primary",
          },
          {
            label: "internal links",
            value: totalLinks,
            icon: Link2,
            color: "text-primary",
          },
          {
            label: "orphan pages",
            value: orphanPages.length,
            icon: Unlink,
            color:
              orphanPages.length > 0
                ? "text-yellow-500"
                : "text-green-500",
          },
          {
            label: "broken links",
            value: brokenLinks.length,
            icon: AlertTriangle,
            color:
              brokenLinks.length > 0
                ? "text-red-500"
                : "text-green-500",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-medium ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
              <stat.icon className="w-5 h-5 text-muted-foreground/30" />
            </div>
          </div>
        ))}
      </div>

      {/* Orphan pages */}
      {orphanPages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
            orphan pages (no incoming links)
          </h2>
          <div className="border border-border divide-y divide-border">
            {orphanPages.map((page) => (
              <div
                key={page.path}
                className="flex items-center gap-3 px-4 py-3 row-hover"
              >
                <span
                  className={`text-[10px] uppercase font-medium px-1.5 py-0.5 ${
                    page.type === "post"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-purple-500/10 text-purple-500"
                  }`}
                >
                  {page.type}
                </span>
                <Link
                  href={
                    page.type === "post"
                      ? `/admin/posts/${page.slug}/edit`
                      : `/admin/projects/${page.slug}/edit`
                  }
                  className="text-sm flex-1 truncate hover:text-primary transition-colors"
                >
                  {page.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {page.path}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Broken links */}
      {brokenLinks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
            broken links
          </h2>
          <div className="border border-border divide-y divide-border">
            {brokenLinks.map((edge) => {
              const source = pages.get(edge.sourcePath);
              return (
                <div
                  key={`${edge.sourcePath}->${edge.targetPath}`}
                  className="flex items-center gap-3 px-4 py-3 row-hover"
                >
                  <Link
                    href={
                      source?.type === "post"
                        ? `/admin/posts/${source.slug}/edit`
                        : `/admin/projects/${source?.slug}/edit`
                    }
                    className="text-sm hover:text-primary transition-colors truncate"
                  >
                    {source?.title ?? edge.sourcePath}
                  </Link>
                  <span className="text-muted-foreground text-xs">&rarr;</span>
                  <span className="text-sm text-red-500">
                    {edge.targetPath}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* All pages table */}
      <section>
        <h2 className="text-xs text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border">
          all pages
        </h2>
        <LinkTable data={tableData} />
      </section>
    </div>
  );
}
