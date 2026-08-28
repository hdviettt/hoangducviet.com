import { Icon } from "@/components/ui/Icon";
import { ROUGH_FILTER, doodleKeyFor, doodleSvg } from "@/lib/doodles";
import type { FeedItem, Post } from "@/lib/posts";
import Link from "next/link";

// The homepage below the ProfileHero: a dominant "Latest" feature, a rail of
// recents, a Collections band (multi-post series), and a "More writing" grid —
// every cover a hand-drawn SEONGON-blue doodle keyed off the title. Server
// component; the only client concern is the doodle SVG, injected inline so it
// inherits the M3 primary token and the shared #rough filter.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// UTC parts so the server and client render the same string (no locale drift).
function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Part titles usually repeat the series name ("<Series> #3: Inverted Index");
// inside a collection card the "Part N" already carries that context.
function partLabel(title: string, seriesTitle: string): string {
  const stripped = title.replace(
    new RegExp(
      `^${seriesTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*#?\\d*\\s*[:·-]\\s*`,
      "i",
    ),
    "",
  );
  return stripped || title;
}

function Doodle({
  art,
  className = "",
  pad = 5,
}: {
  art: string;
  className?: string;
  pad?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-md-surface-container-low text-md-primary ${className}`}
    >
      <div
        className="absolute inset-0 [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
        style={{
          padding: `${pad}%`,
          filter:
            "drop-shadow(2px 3px 0 hsl(var(--md-sys-color-primary) / 0.16))",
        }}
        dangerouslySetInnerHTML={{ __html: doodleSvg(art) }}
      />
    </div>
  );
}

function Eyebrow({ icon, children }: { icon: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.03em] text-md-primary">
      <Icon name={icon} size={16} />
      {children}
    </span>
  );
}

export default function DoodleHome({
  items,
}: {
  items: FeedItem[];
}) {
  const posts: Post[] = items
    .filter((i): i is Extract<FeedItem, { kind: "post" }> => i.kind === "post")
    .map((i) => i.post);
  const seriesItems = items.filter(
    (i): i is Extract<FeedItem, { kind: "series" }> => i.kind === "series",
  );

  const hero = posts[0];
  const recents = posts.slice(1, 4);
  const rest = posts.slice(4);

  // "More writing" grid, grouped by year (newest first).
  const byYear: Array<{ year: string; items: Post[] }> = [];
  for (const p of rest) {
    const year = (p.date_created ?? "").slice(0, 4) || "—";
    const last = byYear[byYear.length - 1];
    if (last && last.year === year) last.items.push(p);
    else byYear.push({ year, items: [p] });
  }

  return (
    <div className="mt-2">
      {/* Shared rough filter — every doodle references #rough by id. */}
      <svg
        width="0"
        height="0"
        className="absolute"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: `<defs>${ROUGH_FILTER}</defs>` }}
      />

      {/* ===== Latest — the dominant feature ===== */}
      {hero && (
        <section className="pt-4 md:pt-8">
          <Eyebrow icon="bolt">Latest</Eyebrow>
          <Link
            href={`/posts/${hero.slug}`}
            className="group mt-5 grid overflow-hidden rounded-[28px] border border-md-outline-variant bg-md-surface shadow-md-1 md:grid-cols-[1fr_1.14fr] md:rounded-[36px]"
          >
            <div className="flex min-h-[300px] flex-col p-7 sm:p-9 md:min-h-[560px] md:p-12">
              <h2 className="mt-1 text-[34px] font-medium leading-[1.03] tracking-tight text-md-on-surface [text-wrap:balance] transition-colors duration-200 ease-md-standard group-hover:text-md-primary sm:text-[44px] md:text-[64px] md:leading-[1.01]">
                {hero.title}
              </h2>
              {hero.description && (
                <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-md-on-surface-variant md:text-[19px]">
                  {hero.description}
                </p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
                <span className="inline-flex h-11 items-center gap-1.5 rounded-full bg-md-primary px-5 text-[15px] font-medium text-md-on-primary">
                  Read more
                  <Icon name="arrow_forward" size={18} />
                </span>
                <span className="text-[13.5px] font-medium text-md-on-surface-variant">
                  {fmtDate(hero.date_created)}
                </span>
              </div>
            </div>
            <Doodle
              art={doodleKeyFor(hero.title ?? "")}
              pad={4}
              className="order-first min-h-[240px] md:order-none md:min-h-[560px]"
            />
          </Link>
        </section>
      )}

      {/* ===== More recent — a rail of the next few ===== */}
      {recents.length > 0 && (
        <section className="mt-12 md:mt-14">
          <Eyebrow icon="schedule">More recent</Eyebrow>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recents.map((p) => (
              <Link
                key={p.slug}
                href={`/posts/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[22px] border border-md-outline-variant bg-md-surface transition-[transform,box-shadow,border-color] duration-200 ease-md-standard hover:-translate-y-1 hover:border-md-outline hover:shadow-md-4"
              >
                <Doodle
                  art={doodleKeyFor(p.title ?? "")}
                  className="aspect-[16/9]"
                />
                <div className="px-5 pb-5 pt-4">
                  <h3 className="text-[18px] font-medium leading-[1.24] tracking-tight text-md-on-surface [text-wrap:balance] transition-colors duration-200 ease-md-standard group-hover:text-md-primary">
                    {p.title}
                  </h3>
                  <span className="mt-2.5 block text-[12.5px] font-medium text-md-on-surface-variant">
                    {fmtDate(p.date_created)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== Collections — multi-part series, bundled ===== */}
      {seriesItems.length > 0 && (
        <section className="mt-16 md:mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <Eyebrow icon="collections_bookmark">Collections</Eyebrow>
              <h2 className="mt-2 text-[30px] font-medium leading-[1.02] tracking-tight text-md-on-surface md:text-[44px]">
                Series, bundled
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {seriesItems.map((s) => {
              const shown = s.parts.slice(0, 3);
              const more = s.parts.length - shown.length;
              return (
                <article
                  key={s.series.slug}
                  className="overflow-hidden rounded-[28px] border border-md-outline-variant p-6 sm:p-8 md:p-10"
                  style={{
                    background:
                      "linear-gradient(150deg, hsl(var(--md-sys-color-primary) / 0.12) 0%, hsl(var(--md-sys-color-primary) / 0.03) 44%, transparent 76%), hsl(var(--md-sys-color-surface))",
                  }}
                >
                  <div className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                    <div className="min-w-0 max-w-[680px]">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-md-primary px-3 py-1.5 text-[12px] font-semibold tracking-[0.03em] text-md-on-primary">
                        <Icon name="collections_bookmark" size={15} />
                        Collection
                      </span>
                      <Link
                        href={`/series/${s.series.slug}`}
                        className="group block"
                      >
                        <h3 className="mt-4 text-[26px] font-medium leading-[1.06] tracking-tight text-md-on-surface [text-wrap:balance] transition-colors duration-200 ease-md-standard group-hover:text-md-primary md:text-[38px]">
                          {s.series.title}
                        </h3>
                      </Link>
                      {s.series.summary && (
                        <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-md-on-surface-variant">
                          {s.series.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                      <span className="text-[13px] font-medium text-md-on-surface-variant">
                        {s.parts.length} parts
                      </span>
                      <Link
                        href={`/series/${s.series.slug}`}
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-md-outline-variant px-5 text-[14px] font-medium text-md-on-surface transition-colors duration-200 ease-md-standard hover:border-md-primary/50 hover:bg-md-primary/[0.06] hover:text-md-primary"
                      >
                        View the collection
                        <Icon name="arrow_forward" size={18} />
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {shown.map((part, i) => (
                      <Link
                        key={part.slug}
                        href={`/posts/${part.slug}`}
                        className="group flex flex-col overflow-hidden rounded-[20px] border border-md-outline-variant bg-md-surface transition-[transform,box-shadow,border-color] duration-200 ease-md-standard hover:-translate-y-1 hover:border-md-outline hover:shadow-md-4"
                      >
                        <Doodle
                          art={doodleKeyFor(part.title, s.series.title)}
                          className="aspect-[16/10]"
                        />
                        <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3.5">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-md-primary">
                            Part {i + 1}
                          </span>
                          <h4 className="line-clamp-2 text-[16px] font-medium leading-[1.28] text-md-on-surface [text-wrap:balance] transition-colors duration-200 group-hover:text-md-primary">
                            {partLabel(part.title, s.series.title)}
                          </h4>
                          <span className="mt-auto pt-2 text-[12px] font-medium text-md-on-surface-variant">
                            {fmtDate(part.date_created)}
                          </span>
                        </div>
                      </Link>
                    ))}
                    {more > 0 && (
                      <Link
                        href={`/series/${s.series.slug}`}
                        className="flex aspect-[16/10] flex-col items-center justify-center gap-0.5 rounded-[20px] border-[1.5px] border-dashed border-md-outline text-md-on-surface-variant transition-colors duration-200 ease-md-standard hover:border-md-primary hover:bg-md-primary/[0.04] hover:text-md-primary sm:aspect-auto"
                      >
                        <span className="text-[30px] font-semibold tracking-tight">
                          +{more}
                        </span>
                        <span className="text-[12px] font-medium">
                          more parts
                        </span>
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== More writing — the rest, by year ===== */}
      {byYear.length > 0 && (
        <section className="mt-16 md:mt-24">
          <div className="mb-8">
            <Eyebrow icon="edit_note">Writing</Eyebrow>
            <h2 className="mt-2 text-[30px] font-medium leading-[1.02] tracking-tight text-md-on-surface md:text-[44px]">
              More writing
            </h2>
          </div>
          {byYear.map((group) => (
            <div key={group.year}>
              <div className="mb-4 mt-8 text-[13px] font-semibold tracking-[0.08em] text-md-on-surface-variant first:mt-0">
                {group.year}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/posts/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[20px] border border-md-outline-variant bg-md-surface transition-[transform,box-shadow,border-color] duration-200 ease-md-standard hover:-translate-y-1 hover:border-md-outline hover:shadow-md-4"
                  >
                    <Doodle
                      art={doodleKeyFor(p.title ?? "")}
                      className="aspect-[16/10]"
                    />
                    <div className="flex flex-1 flex-col px-[18px] pb-[18px] pt-[15px]">
                      <h3 className="text-[17px] font-medium leading-[1.26] tracking-tight text-md-on-surface [text-wrap:balance] transition-colors duration-200 ease-md-standard group-hover:text-md-primary">
                        {p.title}
                      </h3>
                      <span className="mt-auto pt-2 font-mono text-[12.5px] font-medium text-md-on-surface-variant">
                        {fmtDate(p.date_created)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
