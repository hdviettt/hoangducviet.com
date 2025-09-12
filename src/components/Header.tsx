import { Home, FolderOpen, FileText, Briefcase, User, Github, Grid3x3, Minimize2, Wrench } from "lucide-react";
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
    <header className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
      <div className="px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-1">
            <button className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group">
              <Grid3x3 className="w-5 h-5 text-primary" />
            </button>
            
            <div className="mx-2 w-px h-8 bg-border/50" />
            
            <Link
              href="/"
              className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 relative group"
              title="Home"
            >
              <Home className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            
            <Link
              href="/posts"
              className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 relative group"
              title="Blog Posts"
            >
              <FolderOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            
            <Link
              href="/projects"
              className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 relative group"
              title="Projects"
            >
              <Briefcase className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            
            <Link
              href="/tools"
              className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 relative group"
              title="Tools"
            >
              <Wrench className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
            
            {pages.map(({ title, slug }) => {
              const Icon = slug.includes('about') ? User : FileText;
              return (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 relative group"
                  title={title}
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </Link>
              );
            })}
            
            <div className="mx-2 w-px h-8 bg-border/50" />
            
            <a
              href="https://github.com/colbyfayock/test-directus-blog"
              className="p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
              title="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground font-mono">
              {title} OS
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
