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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo + Nav */}
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-foreground hover:opacity-60 transition-opacity">
              <svg viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor">
                <rect x="4" y="9" width="4" height="4"/>
                <rect x="4" y="19" width="4" height="4"/>
                <rect x="12" y="9" width="4" height="4"/>
                <rect x="14" y="13" width="4" height="4"/>
                <rect x="16" y="17" width="4" height="4"/>
                <rect x="24" y="9" width="4" height="4"/>
                <rect x="22" y="13" width="4" height="4"/>
                <rect x="20" y="17" width="4" height="4"/>
                <rect x="18" y="21" width="4" height="4"/>
              </svg>
            </Link>
            <Link
              href="/posts"
              className={`font-mono text-xs uppercase tracking-wider transition-colors ${
                pathname.startsWith("/posts")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Articles
            </Link>
            <Link
              href="/projects"
              className={`font-mono text-xs uppercase tracking-wider transition-colors ${
                pathname.startsWith("/projects")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Projects
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <a
              href="https://github.com/hdviettt"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/hoangducviettt/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/_hdviet/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              {!mounted ? (
                <div className="w-4 h-4" />
              ) : theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
