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

// The expanded story below the hero. Broad on purpose — not anchored to one
// project. Overridden the moment an About body is set in /admin → Settings.
const FALLBACK_ABOUT = `<p>Most of what I do comes down to one habit: I understand systems by rebuilding them from scratch. Search engines, ranking algorithms, AI pipelines — I take them apart and build them again, because you can't win at a system you refuse to understand. That's where my edge comes from, and where most of my writing begins.</p>
<p>These days my work sits between two things: <strong>agentic SEO</strong> — how content earns its place now that search is turning generative — and <strong>building the AI systems businesses actually run on</strong>. I write about how search and AI work under the hood, the strategy of shipping AI inside a company, what China's playbook teaches the rest of us, and the occasional honest post-mortem when something breaks.</p>
<p>If you're trying to make AI real inside your business — or you just like taking things apart to see how they work — we'll probably get along.</p>`;

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

  // Treat tag-only / whitespace-only aboutHtml (e.g. an empty "<p></p>" saved
  // from the editor) as empty so the story never renders blank.
  const aboutText = profile?.aboutHtml?.replace(/<[^>]*>/g, "").trim();
  const bodyHtml = aboutText ? (profile!.aboutHtml as string) : FALLBACK_ABOUT;
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
          read as one continuous block. */}
      <section className="max-w-[560px] mt-2 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-500 fill-mode-backwards">
        <div
          className="text-md-on-surface [&_p]:text-[17px] [&_p]:leading-[28px] [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:font-medium [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </section>

      {/* Proof — experience, certifications, focus */}
      <Resume />
    </div>
  );
}
