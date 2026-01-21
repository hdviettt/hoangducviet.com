"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { Moon, Sun, Github, Facebook, Instagram } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface FileExplorerProps {
  children: ReactNode;
}

export default function FileExplorer({ children }: FileExplorerProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, mounted } = useTheme();

  // Get current path for terminal display
  const getTerminalPath = () => {
    if (pathname === "/") return "~";
    return "~" + pathname;
  };

  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Terminal Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-3xl mx-auto px-4">
          {/* Terminal title bar */}
          <div className="h-8 flex items-center justify-between border-b border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-primary">●</span>
              <span className="hidden sm:inline">hdviet@blog</span>
              <span className="text-muted-foreground/50">:</span>
              <span className="text-foreground">{getTerminalPath()}</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/hdviettt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.facebook.com/hoangducviettt/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/_hdviet/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={toggleTheme}
                className="hover:text-primary transition-colors"
              >
                {!mounted ? (
                  <div className="w-3.5 h-3.5" />
                ) : theme === "light" ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="h-10 flex items-center gap-6 text-sm">
            <Link
              href="/"
              className={`transition-colors ${
                pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <span className="text-muted-foreground/50">./</span>home
            </Link>
            <Link
              href="/posts"
              className={`transition-colors ${
                pathname.startsWith("/posts")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <span className="text-muted-foreground/50">./</span>posts
            </Link>
            <Link
              href="/projects"
              className={`transition-colors ${
                pathname.startsWith("/projects")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <span className="text-muted-foreground/50">./</span>projects
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4">{children}</main>

      {/* Terminal Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-3xl mx-auto px-4 py-4 text-xs text-muted-foreground font-mono">
          <span className="text-primary">$</span> echo "Built with Next.js"
        </div>
      </footer>
    </div>
  );
}
