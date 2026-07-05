import { db } from "@/db";
import { posts, series, seriesPosts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import LinkTable from "./LinkTable";
import LinkGraph from "./LinkGraph";
import PageHeader from "@/components/admin/PageHeader";

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
  linkType: "content" | "navigation" | "series-post";
};

function extractLinksFromMarkdown(content: string): string[] {
  const links: string[] = [];
  // Markdown links: [text](/posts/slug) or [text](/projects/slug)
  const mdLinkRegex = /\]\(\s*\/(posts|projects)\/([^\s)#"]+)/g;
  let match: RegExpExecArray | null;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    links.push(`/${match[1]}/${match[2]}`);
  }
  // HTML in markdown: href="/posts/slug" or src="/posts/slug"
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
  const [allPosts, allProjects, allProjectPosts] = await Promise.all([
    db
      .select({
        slug: posts.slug,
        title: posts.title,
        content: posts.content,
        dateCreated: posts.dateCreated,
      })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(asc(posts.dateCreated)),
    db
      .select({
        slug: series.slug,
        title: series.title,
        description: series.description,
      })
      .from(series)
      .where(eq(series.status, "published")),
    db.select().from(seriesPosts),
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

  const edges: LinkEdge[] = [];

  // 1. Content links (markdown in posts, HTML in projects)
  for (const post of allPosts) {
    if (!post.content) continue;
    const links = extractLinksFromMarkdown(post.content);
    for (const target of links) {
      edges.push({ sourcePath: `/posts/${post.slug}`, targetPath: target, linkType: "content" });
    }
  }
  for (const project of allProjects) {
    if (!project.description) continue;
    const links = extractLinksFromHtml(project.description);
    for (const target of links) {
      edges.push({ sourcePath: `/series/${project.slug}`, targetPath: target, linkType: "content" });
    }
  }

  // 2. Series <-> Post relationships (from seriesPosts join table)
  // Series posts canonicalize at /series/[seriesSlug]/[postSlug]; the series
  // landing links to each part, and each part's series header links back.
  for (const rel of allProjectPosts) {
    const seriesPath = `/series/${rel.seriesSlug}`;
    const postPath = `/series/${rel.seriesSlug}/${rel.postSlug}`;
    edges.push({ sourcePath: seriesPath, targetPath: postPath, linkType: "series-post" });
    edges.push({ sourcePath: postPath, targetPath: seriesPath, linkType: "series-post" });
  }

  // 3. Adjacent post navigation (prev/next links)
  // Posts are ordered by dateCreated — each post links to its prev and next
  for (let i = 0; i < allPosts.length; i++) {
    const current = `/posts/${allPosts[i].slug}`;
    if (i > 0) {
      edges.push({ sourcePath: current, targetPath: `/posts/${allPosts[i - 1].slug}`, linkType: "navigation" });
    }
    if (i < allPosts.length - 1) {
      edges.push({ sourcePath: current, targetPath: `/posts/${allPosts[i + 1].slug}`, linkType: "navigation" });
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

  // Graph data — only edges between existing pages
  const graphNodes = Array.from(pages.values()).map((page) => ({
    id: page.path,
    label: page.title,
    type: page.type,
    incoming: incoming.get(page.path)?.length ?? 0,
  }));
  const graphEdges = uniqueEdges
    .filter((e) => pages.has(e.sourcePath) && pages.has(e.targetPath))
    .map((e) => ({ source: e.sourcePath, target: e.targetPath }));

  return (
    <div className="max-w-5xl">
      <PageHeader title="internal links" count={pages.size} />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "pages", value: pages.size, icon: "description", color: "text-md-primary" },
          { label: "internal links", value: totalLinks, icon: "link", color: "text-md-primary" },
          {
            label: "orphan pages",
            value: orphanPages.length,
            icon: "link_off",
            color: orphanPages.length > 0 ? "text-md-tertiary" : "text-md-primary",
          },
          {
            label: "broken links",
            value: brokenLinks.length,
            icon: "warning",
            color: brokenLinks.length > 0 ? "text-md-error" : "text-md-primary",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-md-outline-variant bg-md-surface-container-low p-5 relative overflow-hidden">
            <Icon
              name={stat.icon}
              size={48}
              className="absolute right-4 bottom-3 text-md-outline-variant"
            />
            <div className="relative">
              <div className={`text-3xl font-medium tabular-nums leading-none ${stat.color}`}>{stat.value}</div>
              <div className="md-label-medium text-md-on-surface-variant mt-2 uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Link graph */}
      {graphNodes.length > 0 && (
        <section className="mb-8">
          <h2 className="md-label-small text-md-on-surface-variant uppercase tracking-wider mb-3 pb-2 border-b border-md-outline-variant">
            link graph
          </h2>
          <LinkGraph nodes={graphNodes} edges={graphEdges} />
        </section>
      )}

      {/* Orphan pages */}
      {orphanPages.length > 0 && (
        <section className="mb-8">
          <h2 className="md-label-small text-md-on-surface-variant uppercase tracking-wider mb-3 pb-2 border-b border-md-outline-variant">
            orphan pages (no incoming links)
          </h2>
          <div className="rounded-xl border border-md-outline-variant divide-y divide-md-outline-variant bg-md-surface-container-low overflow-hidden">
            {orphanPages.map((page) => (
              <div
                key={page.path}
                className="flex items-center gap-3 px-4 py-3 row-hover"
              >
                <span
                  className={`md-label-small uppercase font-medium rounded px-1.5 py-0.5 ${
                    page.type === "post"
                      ? "bg-md-primary-container text-md-on-primary-container"
                      : "bg-md-tertiary-container text-md-on-tertiary-container"
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
                  className="md-body-medium flex-1 truncate hover:text-md-primary transition-colors"
                >
                  {page.title}
                </Link>
                <span className="md-body-small text-md-on-surface-variant">
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
          <h2 className="md-label-small text-md-on-surface-variant uppercase tracking-wider mb-3 pb-2 border-b border-md-outline-variant">
            broken links
          </h2>
          <div className="rounded-xl border border-md-outline-variant divide-y divide-md-outline-variant bg-md-surface-container-low overflow-hidden">
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
                    className="md-body-medium hover:text-md-primary transition-colors truncate"
                  >
                    {source?.title ?? edge.sourcePath}
                  </Link>
                  <span className="text-md-on-surface-variant md-body-small">&rarr;</span>
                  <span className="md-body-medium text-md-error">
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
        <h2 className="md-label-small text-md-on-surface-variant uppercase tracking-wider mb-3 pb-2 border-b border-md-outline-variant">
          all pages
        </h2>
        <LinkTable data={tableData} />
      </section>
    </div>
  );
}
