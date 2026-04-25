import type { Metadata } from "next";
import { getPosts } from "@/lib/posts";
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
  let latestPosts: any[] = [];
  let projectsList: any[] = [];

  try {
    const [profileResult, postsResult, projectsResult] = await Promise.all([
      getProfile(),
      getPosts({ limit: 5 }),
      getProjects(),
    ]);
    profileData = profileResult;
    latestPosts = postsResult;
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
    <div className="pt-16 sm:pt-24 md:pt-32 pb-24 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — picture and name in the spotlight, bio as supporting copy */}
      <section className="mb-32 md:mb-40">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8 md:gap-10">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={mainProfile.name || "Profile"}
              width={256}
              height={256}
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 object-cover shrink-0 rounded-full"
              priority
            />
          )}

          <div className="flex-1 min-w-0">
            {mainProfile?.name && (
              <h1 className="deck-display text-4xl sm:text-5xl md:text-6xl mb-5 md:mb-7">
                {mainProfile.name}
              </h1>
            )}

            {mainProfile?.description && (
              <div
                className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: mainProfile.description }}
              />
            )}

            <div className="mt-7 md:mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
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
                  <Icon className="w-5 h-5" />
                </a>
              ))}
              <span className="w-px h-4 bg-border" />
              <a
                href="mailto:viethd2704@gmail.com"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>viethd2704@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Posts — naked typographic list, deck-list style */}
      {latestPosts.length > 0 && (
        <section className="mb-32 md:mb-40">
          <Link
            href="/posts"
            className="inline-block deck-label hover:text-primary transition-colors"
          >
            <h2 className="deck-label !mb-0">recent writing</h2>
          </Link>

          <ul className="mt-2 divide-y divide-border/50">
            {latestPosts.map((post) => {
              const date = post.date_created
                ? new Date(post.date_created).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })
                : "";

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex items-baseline gap-6 py-5 md:py-6 group"
                  >
                    <span className="flex-1 min-w-0 text-xl md:text-2xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {post.title}
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
    </div>
  );
}
