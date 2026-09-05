import Resume from "@/components/about/Resume";
import ProfileHero from "@/components/layout/ProfileHero";
import { IDENTITY } from "@/lib/identity";
import { createAboutPageSchema } from "@/lib/jsonld";
import { getProfile } from "@/lib/profile";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";
  const title = `About - ${IDENTITY.name}`;
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

export default async function AboutPage() {
  let profile: {
    name?: string | null;
    description?: string | null;
    image?: string | null;
    aboutHtml?: string | null;
  } | null = null;
  try {
    const rows = await getProfile();
    profile = rows[0] ?? null;
  } catch {
    profile = null;
  }

  // The story is whatever you set in /admin → Settings (about body). No code
  // fallback: empty ("<p></p>" or blank) => no story section. Settings is the
  // single source of truth, so deleting it there actually removes it here.
  const aboutText = profile?.aboutHtml?.replace(/<[^>]*>/g, "").trim();
  const bodyHtml = aboutText ? (profile!.aboutHtml as string) : "";
  const jsonLd = createAboutPageSchema();

  return (
    <div className="pb-16 md:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Same identity block as the homepage — the About page reads as a
          seamless expansion of the homepage intro. */}
      <ProfileHero
        name={profile?.name}
        description={profile?.description}
        imageUrl={profile?.image ?? null}
      />

      {/* Expanded story — no divider, same dark tone as the hero bio so the two
          read as one continuous block. Hidden entirely when the body is empty. */}
      {bodyHtml && (
        <section className="mx-auto max-w-[560px] mt-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-500 fill-mode-backwards">
          <div
            className="text-md-on-surface [&_p]:text-[17px] [&_p]:leading-[28px] [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:font-medium [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        </section>
      )}

      {/* Proof — experience, certifications, focus */}
      <Resume />
    </div>
  );
}
