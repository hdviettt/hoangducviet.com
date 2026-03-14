"use client";

import { Facebook, Github, Instagram, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
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

  const isPostPage = pathname.startsWith("/posts/") && pathname !== "/posts";

  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Terminal Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Terminal title bar */}
          <div className="h-8 flex items-center justify-between border-b border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-primary shrink-0">●</span>
              <span className="hidden sm:inline shrink-0">hdviet@blog</span>
              <span className="text-muted-foreground/50 shrink-0">:</span>
              <span className="text-foreground truncate">
                {getTerminalPath()}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <a
                href="https://github.com/hdviettt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.facebook.com/hoangducviettt/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.instagram.com/_hdviet/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors p-1"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={toggleTheme}
                className="hover:text-primary transition-colors p-1"
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
          <nav className="h-10 flex items-center gap-4 sm:gap-6 text-sm overflow-x-auto">
            <Link
              href="/"
              className={`transition-colors whitespace-nowrap ${
                pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              home
            </Link>
            <Link
              href="/posts"
              className={`transition-colors whitespace-nowrap ${
                pathname.startsWith("/posts")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              posts
            </Link>
            <Link
              href="/projects"
              className={`transition-colors whitespace-nowrap ${
                pathname.startsWith("/projects")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              projects
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main
        className={`mx-auto px-4 sm:px-6 pb-16 ${isPostPage ? "max-w-5xl" : "max-w-4xl"}`}
      >
        {children}
      </main>
    </div>
  );
}
