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

          {/* Top Navigation Bar */}
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center justify-center gap-8 max-w-7xl mx-auto">
              {/* Navigation Links */}
              <nav className="flex gap-6">
                <Link
                  href="/"
                  className={`text-sm transition-all duration-200 relative ${pathname === "/"
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  home
                  {pathname === "/" && (
                    <span className="absolute -bottom-1 left-0 w-full h-px bg-foreground" />
                  )}
                </Link>
                <Link
                  href="/projects"
                  className={`text-sm transition-all duration-200 relative ${pathname.startsWith("/projects")
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  projects
                  {pathname.startsWith("/projects") && (
                    <span className="absolute -bottom-1 left-0 w-full h-px bg-foreground" />
                  )}
                </Link>
                <Link
                  href="/posts"
                  className={`text-sm transition-all duration-200 relative ${pathname.startsWith("/posts")
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  articles
                  {pathname.startsWith("/posts") && (
                    <span className="absolute -bottom-1 left-0 w-full h-px bg-foreground" />
                  )}
                </Link>
              </nav>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/hdviettt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5"
                  title="Github"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/hoangducviettt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.instagram.com/_hdviet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-card overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}