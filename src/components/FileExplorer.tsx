import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { Github, Facebook, Instagram } from "lucide-react";

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
        {/* Modern File Explorer Window */}
        <div className="h-full flex flex-col border border-border bg-card">

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="hidden md:flex w-28 bg-muted/30 border-r border-border flex-shrink-0 flex-col">
              <div className="flex-1 flex flex-col items-center py-4 gap-2">
                <nav className="flex flex-col gap-1 w-full px-2">
                  {/* Home */}
                  <Link
                    href="/"
                    className={`flex items-center justify-center px-3 py-2 text-xs font-medium transition-all rounded-md ${pathname === "/"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    home
                  </Link>

                  {/* Projects */}
                  <Link
                    href="/projects"
                    className={`flex items-center justify-center px-3 py-2 text-xs font-medium transition-all rounded-md ${pathname.startsWith("/projects")
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    projects
                  </Link>

                  {/* Articles */}
                  <Link
                    href="/posts"
                    className={`flex items-center justify-center px-3 py-2 text-xs font-medium transition-all rounded-md ${pathname.startsWith("/posts")
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                      }`}
                  >
                    articles
                  </Link>
                </nav>
              </div>

              {/* Social Links */}
              <div className="border-t border-border py-3 flex flex-col items-center gap-2">
                <a
                  href="https://github.com/hdviettt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 text-foreground rounded-md transition-all hover:bg-muted"
                  title="Github"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/hoangducviettt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 text-foreground rounded-md transition-all hover:bg-muted"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/_hdviet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 text-foreground rounded-md transition-all hover:bg-muted"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-card overflow-y-auto">
              {/* Mobile Navigation - Compact single row */}
              <div className="md:hidden bg-muted/30 border-b border-border p-2">
                <div className="flex gap-2 items-center">
                  <Link
                    href="/"
                    className={`flex-1 px-2 py-1.5 text-[11px] font-mono transition-all rounded-md text-center ${pathname === "/"
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                  >
                    home
                  </Link>
                  <Link
                    href="/projects"
                    className={`flex-1 px-2 py-1.5 text-[11px] font-mono transition-all rounded-md text-center ${pathname.startsWith("/projects")
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                  >
                    projects
                  </Link>
                  <Link
                    href="/posts"
                    className={`flex-1 px-2 py-1.5 text-[11px] font-mono transition-all rounded-md text-center ${pathname.startsWith("/posts")
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/50 text-foreground hover:bg-muted"
                      }`}
                  >
                    articles
                  </Link>

                  {/* Social links inline */}
                  <a
                    href="https://github.com/hdviettt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-1.5 text-foreground rounded-md hover:bg-muted transition-all"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.facebook.com/hoangducviettt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-1.5 text-foreground rounded-md hover:bg-muted transition-all"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/_hdviet/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-1.5 text-foreground rounded-md hover:bg-muted transition-all"
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