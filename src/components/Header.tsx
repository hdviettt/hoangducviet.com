import { Home, FolderOpen, FileText, Briefcase, User, Github, Grid3x3, Minimize2 } from "lucide-react";
import Link from "next/link";

import { getGlobalMetadata } from "@/lib/directus";
import { getPages } from "@/lib/pages";

async function Header() {
  let title = "VIET";
  let pages: any[] = [];

  try {
    const metadata = await getGlobalMetadata();
    title = metadata && metadata.length > 0 ? metadata[0].title || "VIET" : "VIET";
  } catch (error) {
    console.error("Error fetching global metadata:", error);
  }

  try {
    pages = await getPages({
      fields: ["title", "slug", "navigation"],
      filter: {
        navigation: {
          _eq: "yes"
        }
      }
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    pages = [];
  }
  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 dock">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <button className="dock-item">
            <Grid3x3 className="w-5 h-5" />
          </button>

          <div className="mx-1 w-px h-8 bg-border" />

          <Link
            href="/"
            className="dock-item"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          <Link
            href="/posts"
            className="dock-item"
            title="Blog Posts"
          >
            <FolderOpen className="w-5 h-5" />
          </Link>

          <Link
            href="/projects"
            className="dock-item"
            title="Projects"
          >
            <Briefcase className="w-5 h-5" />
          </Link>

          {pages.map(({ title, slug }) => {
            const Icon = slug.includes('about') ? User : FileText;
            return (
              <Link
                key={slug}
                href={`/${slug}`}
                className="dock-item"
                title={title}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}

          <div className="mx-1 w-px h-8 bg-border" />

          <a
            href="https://github.com/colbyfayock/test-directus-blog"
            className="dock-item"
            title="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>

        <div className="flex items-center gap-4 pr-2">
          <div className="text-[10px] text-foreground font-mono font-bold uppercase">
            {title} OS
          </div>
          <div className="text-[10px] text-foreground font-mono">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
