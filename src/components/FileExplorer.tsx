import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { Github, Facebook, Instagram, ChevronDown, ChevronRight } from "lucide-react";

interface FileExplorerProps {
  children: ReactNode;
  title?: string;
}

export default function FileExplorer({ children, title = "VIET" }: FileExplorerProps) {
  const pathname = usePathname();
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [archiveData, setArchiveData] = useState<any[]>([]);

  // Fetch archive data when on posts page
  useEffect(() => {
    if (pathname.startsWith("/posts")) {
      // Extract archive data from the DOM (PostsList component renders it)
      const extractArchive = () => {
        const postsData = (window as any).__POSTS_ARCHIVE__;
        if (postsData) {
          setArchiveData(postsData);
          // Expand all years by default
          const years = new Set<string>(postsData.map((item: any) => item.year as string));
          setExpandedYears(years);
        }
      };

      // Try immediately and after a short delay
      extractArchive();
      const timeout = setTimeout(extractArchive, 100);
      return () => clearTimeout(timeout);
    } else {
      setArchiveData([]);
    }
  }, [pathname]);

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      <div className="w-full h-full">
        {/* Neo-brutalist File Explorer Window */}
        <div className="h-full flex flex-col border-4 border-border bg-card">

          {/* Title Bar - Neo-brutalism */}
          <div className="window-titlebar">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="window-control bg-destructive" />
                <div className="window-control bg-secondary" />
                <div className="window-control bg-accent" />
              </div>
              <div className="text-xs text-primary-foreground font-bold uppercase tracking-wider">
                {title}
              </div>
            </div>
          </div>

          {/* Path Bar */}
          <div className="bg-card px-2 md:px-3 py-2 flex items-center border-b-2 border-border">
            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-foreground font-mono">
              <span className="hover:text-primary transition-colors cursor-pointer">~/portfolio</span>
              <span>/</span>
              <span className="font-bold text-primary">
                {pathname === "/" ? "about" :
                  pathname.startsWith("/posts") ? "articles" :
                    pathname.startsWith("/projects") ? "projects" :
                        pathname.slice(1)}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Neo-brutalism */}
            <div className="hidden md:block w-56 bg-muted/20 border-r-4 border-border flex-shrink-0 overflow-y-auto">
              <div className="p-3">
                <div className="text-[10px] text-foreground mb-3 px-2 font-bold uppercase tracking-wider">
                  Files
                </div>

                <nav className="space-y-2">
                  {/* About */}
                  <Link
                    href="/"
                    className={`block px-3 py-2 text-[10px] font-mono transition-all rounded-md border-2 ${pathname === "/"
                      ? "bg-foreground text-background border-border shadow-neo-sm font-bold"
                      : "bg-card text-foreground border-border hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm"
                      }`}
                  >
                    about.md
                  </Link>

                  {/* Projects */}
                  <Link
                    href="/projects"
                    className={`block px-3 py-2 text-[10px] font-mono transition-all rounded-md border-2 ${pathname.startsWith("/projects")
                      ? "bg-foreground text-background border-border shadow-neo-sm font-bold"
                      : "bg-card text-foreground border-border hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm"
                      }`}
                  >
                    projects/
                  </Link>

                  {/* Articles */}
                  <Link
                    href="/posts"
                    className={`block px-3 py-2 text-[10px] font-mono transition-all rounded-md border-2 ${pathname.startsWith("/posts")
                      ? "bg-foreground text-background border-border shadow-neo-sm font-bold"
                      : "bg-card text-foreground border-border hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm"
                      }`}
                  >
                    articles/
                  </Link>
                </nav>

                {/* Social Links */}
                <div className="mt-6 pt-4 border-t-2 border-border">
                  <div className="text-[10px] text-foreground mb-3 px-2 font-bold uppercase tracking-wider">
                    Social
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="https://github.com/hdviettt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center p-2 bg-card text-foreground border-2 border-border rounded-md transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm"
                      title="Github"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.facebook.com/hoangducviettt/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center p-2 bg-card text-foreground border-2 border-border rounded-md transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm"
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                    <a
                      href="https://www.instagram.com/_hdviet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center p-2 bg-card text-foreground border-2 border-border rounded-md transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm"
                      title="Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-card overflow-y-auto">
              {/* Mobile Navigation - Compact single row */}
              <div className="md:hidden bg-muted/20 border-b-2 border-border p-2">
                <div className="flex gap-2 items-center">
                  <Link
                    href="/"
                    className={`flex-1 px-2 py-1.5 text-[10px] font-mono transition-all rounded-md border-2 text-center active:translate-x-0.5 active:translate-y-0.5 ${pathname === "/"
                      ? "bg-primary text-primary-foreground border-border shadow-neo-sm font-bold"
                      : "bg-card text-foreground border-border"
                      }`}
                  >
                    about
                  </Link>
                  <Link
                    href="/projects"
                    className={`flex-1 px-2 py-1.5 text-[10px] font-mono transition-all rounded-md border-2 text-center active:translate-x-0.5 active:translate-y-0.5 ${pathname.startsWith("/projects")
                      ? "bg-primary text-primary-foreground border-border shadow-neo-sm font-bold"
                      : "bg-card text-foreground border-border"
                      }`}
                  >
                    projects
                  </Link>
                  <Link
                    href="/posts"
                    className={`flex-1 px-2 py-1.5 text-[10px] font-mono transition-all rounded-md border-2 text-center active:translate-x-0.5 active:translate-y-0.5 ${pathname.startsWith("/posts")
                      ? "bg-primary text-primary-foreground border-border shadow-neo-sm font-bold"
                      : "bg-card text-foreground border-border"
                      }`}
                  >
                    articles
                  </Link>

                  {/* Social links inline */}
                  <a
                    href="https://github.com/hdviettt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-1.5 bg-card text-foreground border-2 border-border rounded-md active:translate-x-0.5 active:translate-y-0.5"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.facebook.com/hoangducviettt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-1.5 bg-card text-foreground border-2 border-border rounded-md active:translate-x-0.5 active:translate-y-0.5"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/_hdviet/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-1.5 bg-card text-foreground border-2 border-border rounded-md active:translate-x-0.5 active:translate-y-0.5"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}