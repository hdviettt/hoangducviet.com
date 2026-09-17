import CompactWork from "@/components/work/CompactWork";
import FeaturedWork from "@/components/work/FeaturedWork";
import { IDENTITY } from "@/lib/identity";
import { getProjects } from "@/lib/projects";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const description =
    "Two bodies of work: a search engine built from scratch, and an AI platform of agents I built and led inside a company.";
  return {
    title: `Work - ${IDENTITY.name}`,
    description,
    alternates: { canonical: "/work" },
    openGraph: {
      title: `Work - ${IDENTITY.name}`,
      description,
      url: `${baseUrl}/work`,
      siteName: IDENTITY.name,
      // Built by scripts/make-og-work.py from one of the project drawings.
      // Without it this page shared as a blank card.
      images: [
        {
          url: `${baseUrl}/og/work.png`,
          width: 1200,
          height: 630,
          alt: `Work - ${IDENTITY.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Work - ${IDENTITY.name}`,
      description,
      images: [`${baseUrl}/og/work.png`],
    },
  };
}

export default async function WorkPage() {
  const projects = await getProjects();
  // Two, not one and not three. One leaves a single 2-up row looking like the
  // page changed its mind; three leaves an odd number for a two-column grid.
  const lead = projects.slice(0, 2);
  const rest = projects.slice(2);

  return (
    <div className="pb-24 md:pb-32">
      {/* Cung mot khoi voi "Selected work" o trang chu, khong phai mot bien the
          rieng. Truoc day trang nay dung WorkSection: tieu de, mot doan mo ta,
          roi mot carousel toan man. Hai trang cung gioi thieu mot du an ma
          trinh bay khac nhau thi doc ra la hai san pham. */}
      {/* Two carry the page, the rest sit two-up.
          Six full-width split blocks came to 3148px, and every one of them had
          the same silhouette as the one above it, so the sixth project read as
          the first. blog.google's answer to a long list is not a more varied
          card, it is a different section shape: two or three across instead of
          one after another. The cards stay identical; the flow changes. */}
      <div className="work-breakout flex flex-col gap-4 pt-12 md:pt-16">
        {lead.map((p) => (
          <div key={p.slug}>
            <FeaturedWork project={p} />
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="work-breakout mt-4">
          <div className="work-grid">
            {rest.map((p) => (
              <CompactWork key={p.slug} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
