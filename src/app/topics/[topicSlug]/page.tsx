import { IDENTITY } from "@/lib/identity";
import { getTopic, getTopicContents, getTopics } from "@/lib/topics";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Params {
  params: { topicSlug: string };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const topic = await getTopic(params.topicSlug);
  if (!topic) return { title: "Topic" };
  const title = `${topic.title} - ${IDENTITY.name}`;
  return {
    title,
    description: `Projects and writing on ${topic.title}.`,
    alternates: { canonical: `/topics/${topic.slug}` },
  };
}

function feedDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/**
 * One topic, both kinds of thing under it.
 *
 * The site already tagged its writing and its work with the same three words
 * and then kept them on separate pages, so the shape that matters most — a
 * project and the posts that explain it — was the one shape a reader could not
 * see. Work leads because it is the thing; the writing follows because it is
 * the account of it.
 */
export default async function TopicPage({ params }: Params) {
  const topic = await getTopic(params.topicSlug);
  if (!topic) notFound();

  const [{ projects, posts }, all] = await Promise.all([
    getTopicContents(topic.slug),
    getTopics(),
  ]);

  return (
    <div className="work-breakout pb-24 pt-12 md:pb-32 md:pt-16">
      <div className="site-grid items-baseline">
        <h1 className="col-1 text-[1.4375rem] font-medium tracking-[-0.02em] text-md-on-surface">
          {topic.title}
        </h1>
        <p className="col-2 text-[0.9375rem] leading-7 text-md-on-surface-variant">
          {projects.length > 0 && posts.length > 0
            ? `${projects.length} ${projects.length === 1 ? "project" : "projects"} and ${posts.length} ${posts.length === 1 ? "piece" : "pieces"} of writing.`
            : "Nothing filed here yet."}
        </p>
      </div>

      {projects.length > 0 && (
        <section className="mt-14 md:mt-16">
          <h2 className="text-[0.8125rem] font-semibold leading-5 text-md-on-surface-variant">
            Work
          </h2>
          <ul className="mt-5 border-t border-md-outline-variant">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  className="group site-grid items-baseline border-b border-md-outline-variant py-6"
                >
                  <h3 className="col-1 text-[1.1875rem] font-medium leading-[1.25] tracking-[-0.013em] text-md-on-surface transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                  {p.description && (
                    <p className="col-2 text-[0.9375rem] leading-7 text-md-on-surface-variant">
                      {p.description}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {posts.length > 0 && (
        <section className="mt-14 md:mt-16">
          <h2 className="text-[0.8125rem] font-semibold leading-5 text-md-on-surface-variant">
            Writing
          </h2>
          <ul className="mt-5 border-t border-md-outline-variant">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/posts/${p.slug}`}
                  className="group grid grid-cols-1 items-baseline gap-y-1.5 border-b border-md-outline-variant py-[1.3125rem] sm:grid-cols-[5.75rem_1fr] sm:gap-x-6"
                >
                  <span className="text-[0.8125rem] font-medium tabular-nums leading-5 text-md-on-surface-variant sm:pt-[0.25rem]">
                    {feedDate(p.date)}
                  </span>
                  <h3 className="text-[1.1875rem] font-medium leading-[1.25] tracking-[-0.013em] text-md-on-surface [text-wrap:balance] transition-colors group-hover:text-primary">
                    {p.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {all.length > 1 && (
        <nav className="mt-14 flex flex-wrap items-center gap-2.5 md:mt-16">
          {all
            .filter((t) => t.slug !== topic.slug)
            .map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}`}
                className="inline-flex items-center rounded-full bg-md-surface-container-high px-4 py-2 text-[0.8125rem] leading-5 text-md-on-surface transition-colors hover:text-primary"
              >
                {t.title}
              </Link>
            ))}
        </nav>
      )}
    </div>
  );
}
