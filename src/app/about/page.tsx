import { Icon } from "@/components/ui/Icon";
import { IDENTITY, SOCIAL_PROFILES } from "@/lib/identity";
import { createAboutPageSchema } from "@/lib/jsonld";
import { getProfile } from "@/lib/profile";
// Brand marks aren't in Material Symbols — keep lucide for these four only.
import { Facebook, Github, Instagram, Linkedin } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

// lucide brand marks keyed by the identity.ts social labels (UI layer only).
const SOCIAL_ICONS = {
  GitHub: Github,
  Facebook,
  Instagram,
  LinkedIn: Linkedin,
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const title = `About — ${IDENTITY.name}`;
  return {
    title,
    description: IDENTITY.description,
    alternates: { canonical: "/about" },
    openGraph: {
      title,
      description: IDENTITY.description,
      url: `${baseUrl}/about`,
      siteName: IDENTITY.name,
      type: "profile",
      firstName: IDENTITY.givenName,
      lastName: IDENTITY.familyName,
      username: IDENTITY.username,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: IDENTITY.description,
    },
  };
}

// Sensible defaults so /about is never blank before the profile fields are
// filled in from /admin. Both are overridden the moment you set a headline /
// about body in Settings — no deploy needed.
const FALLBACK_HEADLINE =
  "I reverse-engineer how search and AI decide what to rank.";
const FALLBACK_BODY = `<p>I'm ${IDENTITY.name} — ${IDENTITY.jobTitle} at ${IDENTITY.employer.name}. I rebuild search and ranking systems from scratch to understand them, then deploy that understanding for the businesses I work with.</p>`;

export default async function AboutPage() {
  let profile: {
    headline?: string | null;
    aboutHtml?: string | null;
    description?: string | null;
  } | null = null;
  try {
    const rows = await getProfile();
    profile = rows[0] ?? null;
  } catch {
    profile = null;
  }

  const headline = profile?.headline?.trim() || FALLBACK_HEADLINE;
  const bodyHtml =
    profile?.aboutHtml?.trim() ||
    profile?.description?.trim() ||
    FALLBACK_BODY;
  const jsonLd = createAboutPageSchema();

  return (
    <div className="pb-16 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="pt-10 sm:pt-14 md:pt-20 max-w-[660px]">
        <p className="md-label-medium uppercase tracking-widest text-md-on-surface-variant mb-4">
          About
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-[44px] md:leading-[52px] font-normal tracking-tight text-md-on-surface mb-8 md:mb-10">
          {headline}
        </h1>

        <div
          className="article-content [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        {/* Socials + email — same set as the homepage hero, from identity.ts */}
        <div className="mt-12 pt-8 border-t border-md-outline-variant flex flex-wrap items-center gap-x-5 gap-y-3">
          {SOCIAL_PROFILES.map(({ href, label }) => {
            const Brand = SOCIAL_ICONS[label];
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard"
                aria-label={label}
              >
                <Brand className="w-5 h-5" />
              </a>
            );
          })}
          <span className="w-px h-4 bg-md-outline-variant" />
          <a
            href={`mailto:${IDENTITY.email}`}
            className="inline-flex items-center gap-1.5 md-body-medium text-md-on-surface-variant hover:text-primary transition-colors duration-200 ease-md-standard"
          >
            <Icon name="mail" size={18} />
            <span>{IDENTITY.email}</span>
          </a>
        </div>
      </section>
    </div>
  );
}
