import type { Metadata } from "next";
import { type FeedItem, getFeedItems } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import { getProjects } from "@/lib/projects";
import { getGlobalMetadata } from "@/lib/global";
import { createWebSiteSchema, createPersonSchema } from "@/lib/jsonld";
import { Facebook, Github, Instagram, Linkedin, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [global, profileData] = await Promise.all([
      getGlobalMetadata(),
      getProfile(),
    ]);
    const siteTitle =
      global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
    const siteTagline =
      global && global.length > 0
        ? global[0].tagline
        : "Hoang Duc Viet's personal blog";
    const profileImage = profileData?.[0]?.image || null;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
    const imageUrl = profileImage
      ? profileImage.startsWith("http")
        ? profileImage
        : `${baseUrl}${profileImage}`
      : null;

    return {
      title: siteTitle,
      description: siteTagline,
      alternates: { canonical: "/" },
      openGraph: {
        title: siteTitle,
        description: siteTagline || "",
        url: baseUrl,
        siteName: siteTitle,
        type: "website",
        images: imageUrl ? [{ url: imageUrl, alt: siteTitle || "" }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: siteTitle,
        description: siteTagline || "",
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch {
    return { title: "Hoang Duc Viet" };
  }
}

export default async function Home() {
  let profileData: any[] = [];
  let recentItems: FeedItem[] = [];
  let projectsList: any[] = [];

  try {
    const [profileResult, itemsResult, projectsResult] = await Promise.all([
      getProfile(),
      getFeedItems({ limit: 5 }),
      getProjects(),
    ]);
    profileData = profileResult;
    recentItems = itemsResult;
    projectsList = projectsResult;
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="py-12">
        <p className="text-muted-foreground text-sm">Unable to load content.</p>
      </div>
    );
  }

  if (profileData.length === 0) {
    return (
      <div className="py-12">
        <p className="text-muted-foreground text-sm">No content available.</p>
      </div>
    );
  }

  const mainProfile = profileData[0];
  const imageUrl = mainProfile.image || null;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com";
  const profileImageUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : `${baseUrl}${imageUrl}`
    : undefined;

  const jsonLd = [
    createWebSiteSchema({
      name: mainProfile.name || "Hoang Duc Viet",
      description: "Personal blog",
      url: baseUrl,
    }),
    createPersonSchema({
      name: mainProfile.name || "Hoang Duc Viet",
      url: baseUrl,
      image: profileImageUrl,
      sameAs: [
        "https://github.com/hdviettt",
        "https://www.facebook.com/hoangducviettt/",
        "https://www.instagram.com/_hdviet/",
        "https://www.linkedin.com/in/hdviet/",
      ],
    }),
  ];

  return (
    <div className="pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — content sized naturally, no forced viewport-height. Deck
          vibe via the faded label + bold name; cornering moved to a single
          @hdviet wordmark in the page footer (rather than inside the hero,
          which created accidental empty space below content). */}
      <section className="pt-12 sm:pt-16 md:pt-20 pb-16 md:pb-20">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-7 md:gap-8 max-w-3xl">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={mainProfile.name || "Profile"}
              width={192}
              height={192}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover shrink-0 rounded-full animate-in fade-in zoom-in-95 duration-500 fill-mode-backwards"
              priority
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="deck-label animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100 fill-mode-backwards">
              personal blog
            </span>
            {mainProfile?.name && (
              <h1 className="deck-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-5 md:mb-6 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-backwards">
                {mainProfile.name}
              </h1>
            )}
            {mainProfile?.description && (
              <div
                className="text-base sm:text-lg text-foreground/75 leading-relaxed [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 fill-mode-backwards"
                dangerouslySetInnerHTML={{ __html: mainProfile.description }}
              />
            )}
            <div className="mt-5 md:mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400 fill-mode-backwards">
              {[
                { href: "https://github.com/hdviettt", icon: Github, label: "GitHub" },
                { href: "https://www.facebook.com/hoangducviettt/", icon: Facebook, label: "Facebook" },
                { href: "https://www.instagram.com/_hdviet/", icon: Instagram, label: "Instagram" },
                { href: "https://www.linkedin.com/in/hdviet/", icon: Linkedin, label: "LinkedIn" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
              <span className="w-px h-4 bg-border" />
              <a
                href="mailto:viethd2704@gmail.com"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>viethd2704@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Recent writing — multi-post projects collapse to a single series row
          so a chronological list isn't dominated by one project's parts. */}
      {recentItems.length > 0 && (
        <section className="mb-16 sm:mb-20 md:mb-24">
          <Link
            href="/posts"
            className="inline-block deck-label hover:text-primary transition-colors"
          >
            <h2 className="deck-label !mb-0">recent writing</h2>
          </Link>

          <ul className="mt-2 divide-y divide-border/50">
            {recentItems.map((item) => {
              if (item.kind === "series") {
                const range = formatDateRange(
                  new Date(item.firstDate),
                  new Date(item.lastDate),
                );
                return (
                  <li key={`series-${item.project.slug}`}>
                    <Link
                      href={`/projects/${item.project.slug}`}
                      className="flex items-baseline gap-6 py-5 md:py-6 group"
                    >
                      <span className="flex-1 min-w-0 flex items-baseline gap-3 flex-wrap">
                        <span className="text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {item.project.title}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                          {item.parts.length} parts
                        </span>
                      </span>
                      <span className="text-xs md:text-sm tabular-nums text-muted-foreground/60 shrink-0">
                        {range}
                      </span>
                    </Link>
                  </li>
                );
              }
              const date = item.post.date_created
                ? new Date(item.post.date_created).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })
                : "";
              return (
                <li key={item.post.slug}>
                  <Link
                    href={`/posts/${item.post.slug}`}
                    className="flex items-baseline gap-6 py-5 md:py-6 group"
                  >
                    <span className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {item.post.title}
                    </span>
                    <span className="text-xs md:text-sm tabular-nums text-muted-foreground/60 shrink-0">
                      {date}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Projects — same naked-list treatment, no card boxes */}
      {projectsList.length > 0 && (
        <section>
          <Link
            href="/projects"
            className="inline-block deck-label hover:text-primary transition-colors"
          >
            <h2 className="deck-label !mb-0">projects</h2>
          </Link>

          <ul className="mt-2 divide-y divide-border/50">
            {projectsList.map((project: any) => (
              <li key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="block py-6 md:py-7 group"
                >
                  <div className="flex items-baseline gap-6">
                    <h3 className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {project.title || "Untitled"}
                    </h3>
                    {project.date_created && (
                      <span className="text-xs md:text-sm tabular-nums text-muted-foreground/60 shrink-0">
                        {new Date(project.date_created).getFullYear()}
                      </span>
                    )}
                  </div>
                  {project.summary && (
                    <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl line-clamp-2">
                      {project.summary}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Page wordmark — mirrors the SEONGON wordmark in the bottom-left of
          your deck slides. Sits at the foot of the page so it doesn't punch
          empty space into the hero. */}
      <div className="mt-20 md:mt-24 text-xs font-semibold uppercase tracking-widest text-primary/40 select-none">
        @hdviet · 2026
      </div>
    </div>
  );
}

// "Mar 16 – Mar 28, 26" if same year, "Mar 16, 25 – Mar 28, 26" if not.
// If only one date (single-day series), drop the range.
function formatDateRange(first: Date, last: Date): string {
  const sameDay =
    first.getFullYear() === last.getFullYear() &&
    first.getMonth() === last.getMonth() &&
    first.getDate() === last.getDate();
  if (sameDay) {
    return last.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  }
  const sameYear = first.getFullYear() === last.getFullYear();
  if (sameYear) {
    const start = first.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = last.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
    return `${start} – ${end}`;
  }
  const start = first.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  const end = last.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
  return `${start} – ${end}`;
}
