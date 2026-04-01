import { getPosts } from "@/lib/posts";
import { getProfile } from "@/lib/profile";
import { getProjects } from "@/lib/projects";
import { Facebook, Github, Instagram, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

  return (
    <div className="py-8 sm:py-12 md:py-16">
      {/* Profile Section */}
      <section className="mb-10 sm:mb-12 md:mb-16">
        <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-8">
          {/* Image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={mainProfile.name || "Profile"}
              className="w-16 h-16 md:w-40 md:h-40 object-cover border border-border shrink-0 rounded-full"
            />
          )}

          {/* Text column */}
          <div className="min-w-0">
            {mainProfile?.name && (
              <h1 className="text-lg sm:text-xl md:text-3xl font-medium text-foreground mb-3 md:mb-4">
                {mainProfile.name}
              </h1>
            )}

            {mainProfile?.description && (
              <div
                className="text-sm md:text-base text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: mainProfile.description }}
              />
            )}

            {/* Social Links */}
            <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-5">
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
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <a
              href="mailto:viethd2704@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-3 md:mt-4"
            >
              <Mail className="w-4 h-4" />
              <span>viethd2704@gmail.com</span>
            </a>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      {latestPosts.length > 0 && (
        <section>
          <Link href="/posts" className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4 md:mb-5 block">
            <h2>Posts</h2>
          </Link>

          <ul className="space-y-2 md:space-y-3">
            {latestPosts.map((post) => {
              const date = post.date_created
                ? new Date(post.date_created).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })
                : "";

              return (
                <li key={post.slug}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-1.5 md:py-2 group text-sm md:text-base"
                  >
                    <span className="text-muted-foreground/50 text-xs md:text-sm w-16 shrink-0 order-2 sm:order-1">
                      {date}
                    </span>
                    <span className="text-foreground group-hover:text-primary transition-colors order-1 sm:order-2">
                      {post.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Projects Section */}
      {projectsList.length > 0 && (
        <section className="mt-10 sm:mt-12 md:mt-16">
          <Link href="/projects" className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4 md:mb-5 block">
            <h2>Projects</h2>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {projectsList.map((project: any) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group flex flex-col border border-border hover:border-primary/40 transition-colors bg-background overflow-hidden"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title || ""}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl md:text-6xl font-medium text-muted-foreground/10 select-none">
                        {(project.title || "?")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 md:p-5 flex flex-col gap-1.5">
                  <h3 className="text-base md:text-lg font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                    {project.title || "Untitled"}
                  </h3>
                  {project.summary && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {project.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
