import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { Github, Facebook, Instagram, Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface FileExplorerProps {
  children: ReactNode;
  title?: string;
}

export default function FileExplorer({ children, title = "VIET" }: FileExplorerProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen bg-background overflow-hidden overflow-x-hidden">
      <div className="w-full h-full overflow-x-hidden">
        <div className="h-full flex flex-col bg-background overflow-x-hidden">

          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="flex items-center justify-between h-14 px-4 sm:px-6 max-w-7xl mx-auto">
              {/* Logo/Brand */}
              <Link href="/" className="font-semibold text-foreground tracking-tight">
                {title}
              </Link>

              {/* Center Navigation Links - Desktop */}
              <nav className="hidden md:flex items-center gap-6">
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

              {/* Right side - Social, Theme toggle & Mobile menu */}
              <div className="flex items-center gap-1">
                {/* Social links - hidden on small mobile */}
                <div className="hidden sm:flex items-center gap-1">
                  <a
                    href="https://github.com/hdviettt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  <a
                    href="https://www.facebook.com/hoangducviettt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  <a
                    href="https://www.instagram.com/_hdviet/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  <div className="w-px h-4 bg-border mx-2" />
                </div>

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

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors md:hidden"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Menu className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-border bg-background">
                <nav className="flex flex-col px-4 py-3 space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      pathname === "/"
                        ? "text-foreground font-medium bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      pathname.startsWith("/projects")
                        ? "text-foreground font-medium bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    Projects
                  </Link>
                  <Link
                    href="/posts"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      pathname.startsWith("/posts")
                        ? "text-foreground font-medium bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    Articles
                  </Link>

                  {/* Social links in mobile menu */}
                  <div className="flex items-center gap-2 px-3 py-2 sm:hidden">
                    <a
                      href="https://github.com/hdviettt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="w-4 h-4" strokeWidth={1.5} />
                    </a>
                    <a
                      href="https://www.facebook.com/hoangducviettt/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Facebook className="w-4 h-4" strokeWidth={1.5} />
                    </a>
                    <a
                      href="https://www.instagram.com/_hdviet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Instagram className="w-4 h-4" strokeWidth={1.5} />
                    </a>
                  </div>
                </nav>
              </div>
            )}
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