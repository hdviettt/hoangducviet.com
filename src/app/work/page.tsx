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

  return (
    <div className="pb-24 md:pb-32">
      {/* Cung mot khoi voi "Selected work" o trang chu, khong phai mot bien the
          rieng. Truoc day trang nay dung WorkSection: tieu de, mot doan mo ta,
          roi mot carousel toan man. Hai trang cung gioi thieu mot du an ma
          trinh bay khac nhau thi doc ra la hai san pham. */}
      <div className="work-breakout flex flex-col pt-12 md:pt-16">
        {projects.map((p) => (
          <div
            key={p.slug}
            className="border-t border-md-outline-variant py-14 first:border-t-0 first:pt-0 md:py-20"
          >
            <FeaturedWork project={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
