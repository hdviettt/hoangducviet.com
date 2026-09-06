import { feedRowDate } from "@/components/posts/FeedRow";
import { Icon } from "@/components/ui/Icon";
import MediaCarousel from "@/components/widgets/MediaCarousel";
import FeaturedClip from "@/components/work/FeaturedClip";
import { ChildRow } from "@/components/work/ProjectRow";
import { Chips } from "@/components/work/StackChips";
import { IDENTITY } from "@/lib/identity";
import { getProjectBySlug } from "@/lib/projects";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: `Work - ${IDENTITY.name}` };
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const description = project.tagline ?? project.description ?? "";
  return {
    title: `${project.title} - ${IDENTITY.name}`,
    description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description,
      url: `${baseUrl}/work/${project.slug}`,
      type: "article",
    },
  };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-[14px] font-semibold tracking-[-0.005em] text-md-on-surface-variant">
      {children}
    </h2>
  );
}

export default async function ProjectDeepDivePage({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  // Co nguon moi tinh la co media: mot dong luu hut voi src rong van dem la 1.
  // Media dau tien di len lam hero; nhung cai con lai moi vao carousel. Mot
  // carousel mot slide la mot carousel khong co gi de truot.
  const shown = project.media.filter((m) => m.src?.trim());
  const hero = shown[0];
  const rest = shown.slice(1);
  const hasChildren = !!project.children && project.children.length > 0;
  const hasPosts = !!project.posts && project.posts.length > 0;
  const hasStack = project.models.length > 0 || project.stack.length > 0;

  const stackGroups = [
    ...(project.models.length > 0
      ? [{ group: "Models", items: project.models }]
      : []),
    ...project.stack,
  ];

  return (
    // Can giua trong khung 1044px cua vo trang, giong trang bai viet. Thieu
    // mx-auto thi khoi 880px dinh sat mep trai va bo trong 164px ben phai —
    // do 1440px thi le trai 198, le phai 473.
    <div className="mx-auto max-w-[880px] pb-20 md:pb-28">
      {/* Breadcrumb. A trail, not a back arrow: "← Work" only says where the
          previous tab was, while the trail says where this page sits. The last
          crumb is the section rather than the title, since the title is the h1
          directly underneath. */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 pt-10 text-[13px] sm:pt-12 md:pt-14"
      >
        <Link
          href="/"
          className="rounded-sm text-md-on-surface-variant underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Home
        </Link>
        <Icon
          name="chevron_right"
          size={16}
          className="text-md-outline"
          aria-hidden="true"
        />
        <Link
          href="/work"
          className={`rounded-sm underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            project.parent ? "text-md-on-surface-variant" : "text-md-on-surface"
          }`}
          aria-current={project.parent ? undefined : "page"}
        >
          Work
        </Link>
        {project.parent && (
          <>
            <Icon
              name="chevron_right"
              size={16}
              className="text-md-outline"
              aria-hidden="true"
            />
            <Link
              href={`/work/${project.parent.slug}`}
              aria-current="page"
              className="rounded-sm text-md-on-surface underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {project.parent.title}
            </Link>
          </>
        )}
      </nav>

      {/* ===== Hero ===== */}
      <header className="mt-8">
        <h1 className="max-w-[20ch] text-balance text-[34px] font-medium leading-[1.05] tracking-[-0.03em] text-md-on-surface sm:text-[44px]">
          {project.title}
        </h1>
        {project.description && (
          <p className="mt-5 max-w-[66ch] text-[18px] leading-[1.55] text-md-on-surface-variant">
            {project.description}
          </p>
        )}
      </header>

      {/* ===== Hero: featured media, ngay duoi tieu de va to het cot =====

          Truoc day media nam sau ca phan stack, va no la mot carousel bi khoa
          be rong. Trang bai cua Google dat anh ngay duoi tieu de va cho no
          chiem tron cot — do la thu bao cho nguoi doc biet du an nay trong ra
          sao truoc khi ho phai doc bat cu dong nao. */}
      {hero && (
        <figure className="mt-10 md:mt-12">
          <div className="overflow-hidden rounded-2xl bg-md-surface-container-low">
            {hero.type === "video" ? (
              <FeaturedClip
                src={hero.src}
                label={hero.caption || project.title}
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <img
                src={hero.src}
                alt={hero.caption || project.title}
                loading="eager"
                decoding="async"
                className="aspect-[16/9] w-full object-cover"
              />
            )}
          </div>
          {hero.caption && (
            <figcaption className="mt-3 text-[14px] leading-6 text-md-on-surface-variant">
              {hero.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* ===== Built with: the stack, up top ===== */}
      {hasStack && (
        <section className="mt-11 border-t border-md-outline-variant pt-8 md:mt-12">
          <SectionLabel>Built with</SectionLabel>
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-[max-content_1fr] sm:gap-y-4">
            {stackGroups.map((g) => (
              <Fragment key={g.group}>
                <div className="text-[13.5px] font-medium text-md-on-surface-variant sm:pt-[8px]">
                  {g.group}
                </div>
                <Chips items={g.items} />
              </Fragment>
            ))}
          </div>
        </section>
      )}

      {/* ===== Media: carousel of real screenshots and clips ===== */}
      {rest.length > 0 && (
        <div
          className={`work-carousel mt-12 md:mt-14 ${
            rest.length > 1 ? "" : "work-carousel--one"
          }`}
        >
          <MediaCarousel
            items={rest.map((m) => ({
              src: m.src,
              caption: m.caption,
              type: m.type,
              fit: "cover",
            }))}
            ratio="16 / 9"
            mat="ambient"
            label={`${project.title} media`}
          />
        </div>
      )}

      {/* ===== The story ===== */}
      {project.content && (
        <div
          className="article-content mt-14 md:mt-16"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted admin content
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      )}

      {/* ===== Pieces on the platform ===== */}
      {hasChildren && (
        <section className="mt-14 border-t border-md-outline-variant pt-10 md:mt-16">
          <SectionLabel>Pieces on the platform</SectionLabel>
          <div>
            {project.children?.map((c) => (
              <ChildRow key={c.slug} child={c} />
            ))}
          </div>
        </section>
      )}

      {/* ===== Writing ===== */}
      {hasPosts && (
        <section className="mt-14 border-t border-md-outline-variant pt-10 md:mt-16">
          <h2 className="mb-4 text-[22px] font-medium tracking-[-0.02em] text-md-on-surface">
            Related Articles
          </h2>
          <div>
            {project.posts?.map((p) => (
              <Link
                key={p.slug}
                href={`/posts/${p.slug}`}
                className="group grid grid-cols-1 items-baseline gap-y-1.5 border-b border-md-outline-variant py-[21px] sm:grid-cols-[92px_1fr] sm:gap-x-6"
              >
                <span className="text-[13px] font-medium tabular-nums text-md-on-surface-variant sm:pt-[4px]">
                  {feedRowDate(p.date_created)}
                </span>
                <h3 className="text-[21px] font-medium leading-[1.25] tracking-[-0.013em] text-md-on-surface [text-wrap:balance] transition-colors group-hover:text-primary">
                  {p.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
