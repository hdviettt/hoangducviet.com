import FeaturedWork from "@/components/work/FeaturedWork";
import type { Project } from "@/lib/projects";
import Link from "next/link";

/**
 * Homepage "Selected work": the featured (top-level) projects, one split
 * editorial block each — pitch on a narrow rail, artwork on a wide one.
 *
 * The previous version stacked title, paragraph and a full-width carousel, so
 * every project read as its own page section and the three of them buried the
 * writing feed underneath. A split block is roughly half the height and puts
 * the three side by side in the eye rather than end to end.
 *
 * The eyebrow is the project's topics, set in the CMS from the same vocabulary
 * the posts use. It was the child count, which meant two of the three said
 * "Project" — a word that tells a reader nothing they cannot already see.
 *
 * The masthead used to be a 35px heading stacked over a summary sentence, in a
 * column that left the right half of the row empty, and it cost about 150px
 * before the first project. Two problems in one: the height, and that the
 * Articles section directly below opens at 23px medium. Two sibling sections
 * with headings that far apart read as two designs. They match now, and the
 * sentence sits beside the heading instead of under it.
 *
 * The masthead breaks out with the blocks rather than staying on the column.
 * It used to sit 72px to their right, so the section's own heading did not
 * line up with the projects under it — a stagger that read as intent while the
 * heading was 35px and as a mistake once it was not.
 */
export default function SelectedWork({ projects }: { projects: Project[] }) {
  const topLevel = projects.filter((p) => !p.parentSlug);
  if (topLevel.length === 0) return null;

  // `pb`, khong phai `mb`: le duoi cua muc nay va le tren cua muc Articles la
  // hai le ke nhau nen chung triet tieu, chi con cai lon hon. Padding thi cong
  // them that.
  return (
    <section id="work" className="scroll-mt-8 pb-6 md:pb-8">
      {/* `items-baseline` rather than `items-center`: the heading and the
          sentence are different sizes, and sitting them on a shared baseline is
          what makes the row read as one line of the page instead of two things
          that happen to be next to each other. */}
      <div className="work-breakout grid grid-cols-1 gap-x-12 gap-y-3 md:grid-cols-[auto_1fr] md:items-baseline md:gap-y-0">
        <h2 className="text-[1.4375rem] font-medium tracking-[-0.02em] text-md-on-surface">
          Selected work
        </h2>
        <p className="max-w-[38.75rem] text-[0.9375rem] leading-7 text-md-on-surface-variant">
          A search engine built from scratch, and an AI platform of agents I
          built and led inside a company.
        </p>
      </div>

      <div className="work-breakout mt-9 flex flex-col md:mt-12">
        {topLevel.map((p) => (
          <div
            key={p.slug}
            className="border-t border-md-outline-variant py-16 first:border-t-0 first:pt-2 md:py-24"
          >
            <FeaturedWork project={p} />
          </div>
        ))}

        {/* Ket muc bang mot duong ke bi ngat o giua boi cai nut.
            Ba khoi work o tren da duoc ngan cach bang duong ke cung mau, nen
            day doc ra la duong ke cuoi cung cua chinh muc nay — no dong muc
            lai truoc khi sang Articles. Nut nam giua duong ke thi khong the
            bi doc nham thanh dau muc ben duoi, va khong can mui ten: no dang
            dung tren mot duong ngang chu khong phai trong mot hang chu. */}
        <div className="flex items-center gap-5 md:gap-8">
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-md-outline-variant"
          />
          <Link
            href="/work"
            className="md-btn md-btn-outlined md-btn-pill md-btn-lg shrink-0 no-underline"
          >
            All work
          </Link>
          <span
            aria-hidden="true"
            className="h-px flex-1 bg-md-outline-variant"
          />
        </div>
      </div>
    </section>
  );
}
