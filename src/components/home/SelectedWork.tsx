import { Icon } from "@/components/ui/Icon";
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
 * The eyebrow is the child count, which is the one fact that separates these
 * three: the platform is a family, the other two stand alone.
 */
export default function SelectedWork({ projects }: { projects: Project[] }) {
  const topLevel = projects.filter((p) => !p.parentSlug);
  if (topLevel.length === 0) return null;

  return (
    <section id="work" className="scroll-mt-8">
      <div className="max-w-[820px]">
        <h2 className="text-[28px] font-normal leading-[1.18] tracking-[-0.25px] text-md-on-surface sm:text-[36px] lg:text-[40px]">
          Selected work
        </h2>
        <p className="mt-4 max-w-[620px] text-[16px] leading-7 text-md-on-surface-variant">
          A search engine built from scratch, and an AI platform of agents I
          built and led inside a company.
        </p>
      </div>

      <div className="work-breakout mt-12 flex flex-col md:mt-16">
        {topLevel.map((p) => (
          <div
            key={p.slug}
            className="border-t border-md-outline-variant py-14 first:border-t-0 first:pt-2 md:py-20"
          >
            <FeaturedWork project={p} />
          </div>
        ))}
      </div>

      {/* Ba du an tren day la nhung cai duoc chon; /work con cac agent con nua.
          Nut nay nam NGOAI `work-breakout` de no thang hang voi tieu de muc,
          chu khong thang voi mep dai rong — dai rong la cua khoi anh, khong
          phai cua muc. */}
      <Link
        href="/work"
        className="md-btn md-btn-outlined md-btn-pill md-btn-lg mt-12 no-underline md:mt-14"
      >
        All work
        <Icon name="arrow_forward" size={20} aria-hidden="true" />
      </Link>
    </section>
  );
}
