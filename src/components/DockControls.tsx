"use client";

import { Home, FolderOpen, Briefcase, User, FileText, Github, Grid3x3 } from "lucide-react";
import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";

interface Page {
  title: string;
  slug: string;
}

interface DockControlsProps {
  pages: Page[];
  title: string;
}

export default function DockControls({ pages, title }: DockControlsProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <button className="dock-item">
          <Grid3x3 className="w-5 h-5" />
        </button>

        <div className="mx-1 w-px h-8 bg-border" />

        <Link href="/" className="dock-item" title="Home">
          <Home className="w-5 h-5" />
        </Link>

        <Link href="/posts" className="dock-item" title="Blog Posts">
          <FolderOpen className="w-5 h-5" />
        </Link>

        <Link href="/projects" className="dock-item" title="Projects">
          <Briefcase className="w-5 h-5" />
        </Link>

        {pages.map(({ title, slug }) => {
          const Icon = slug.includes("about") ? User : FileText;
          return (
            <Link key={slug} href={`/${slug}`} className="dock-item" title={title}>
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

        <DarkModeToggle />
      </div>

      <div className="flex items-center gap-4 pr-2">
        <div className="text-[10px] text-foreground font-mono font-bold uppercase">
          {title} OS
        </div>
        <ClientTime />
      </div>
    </div>
  );
}

function ClientTime() {
  return (
    <div className="text-[10px] text-foreground font-mono">
      {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
    </div>
  );
}
