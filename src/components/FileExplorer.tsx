import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Github, Facebook, Instagram, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface FileExplorerProps {
  children: ReactNode;
  title?: string;
}

export default function FileExplorer({ children, title = "VIET" }: FileExplorerProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <div className="h-screen bg-background overflow-hidden overflow-x-hidden">
      <div className="w-full h-full overflow-x-hidden">
        <div className="h-full flex flex-col bg-background overflow-x-hidden">

          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-4 sm:gap-8 h-14 px-4 sm:px-6 max-w-7xl mx-auto">
              {/* Navigation Links */}
              <nav className="flex items-center gap-4 sm:gap-6">
                <Link
                  href="/"
                  className={`text-sm transition-colors ${
                    pathname === "/"
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/projects"
                  className={`text-sm transition-colors ${
                    pathname.startsWith("/projects")
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Projects
                </Link>
                <Link
                  href="/posts"
                  className={`text-sm transition-colors ${
                    pathname.startsWith("/posts")
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Articles
                </Link>
              </nav>

              {/* Social & Theme toggle */}
              <div className="flex items-center gap-1">
                <a
                  href="https://github.com/hdviettt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                  title="GitHub"
                >
                  <Github className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.facebook.com/hoangducviettt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.instagram.com/_hdviet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1.5} />
                </a>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {!mounted ? (
                    <div className="w-4 h-4" />
                  ) : theme === "light" ? (
                    <Moon className="w-4 h-4" strokeWidth={1.5} />
                  ) : (
                    <Sun className="w-4 h-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 bg-background overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}