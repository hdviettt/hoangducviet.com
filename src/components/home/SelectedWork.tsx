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

  // `pb`, khong phai `mb`: le duoi cua muc nay va le tren cua muc Articles la
  // hai le ke nhau nen chung triet tieu, chi con cai lon hon. Padding thi cong
  // them that. Do truoc khi sua: tren nut 89px, duoi 72px — nut nghieng ve
  // phia Articles nen doc ra la cua Articles.
  return (
    <section id="work" className="scroll-mt-8 pb-8 md:pb-12">
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

        {/* Trong `work-breakout`, khong phai ngoai.
            Dat ngoai thi no can theo cot chu 1044, tuc la thang hang voi muc
            "Articles" ben duoi chu khong thang voi chinh cac khoi work no
            thuoc ve — do o 2000px: nut o 349, con chu cua khoi work o 202. Ket
            hop voi khoang trong phia tren lon hon phia duoi, no doc ra la mot
            phan cua Articles. */}
        <Link
          href="/work"
          className="md-btn md-btn-outlined md-btn-pill md-btn-lg mt-2 self-start no-underline"
        >
          All work
          <Icon name="arrow_forward" size={20} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
