"use client";

import CommandPalette from "@/components/admin/CommandPalette";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

/**
 * The content half of the admin shell.
 *
 * Its one real job is deciding whether the current route is an editor. An
 * editor wants the whole pane and manages its own edges; a list page wants
 * gutters. Deciding it here removes the negative margins PostForm was using to
 * cancel padding the layout had just applied, which is two components fighting
 * over one box.
 */
export default function AdminShellClient({
  children,
  posts,
  series,
}: {
  children: React.ReactNode;
  posts: Array<{ slug: string; title: string; status: string }>;
  series: Array<{ slug: string; title: string }>;
}) {
  const pathname = usePathname();

  // Only the POST editor takes the whole pane. It has its own top bar, status
  // bar and scroll container. The project and work forms are ordinary forms:
  // handing them a full-bleed pane stretched every field to the width of the
  // window, because nothing in them caps a width.
  const inPostEditor = useMemo(
    () => /^\/admin\/posts\/(new|[^/]+\/edit)$/.test(pathname),
    [pathname],
  );
  const isEditor = inPostEditor;

  return (
    <>
      <main
        className={
          isEditor
            ? "flex-1 min-w-0 h-screen overflow-hidden"
            : "flex-1 min-w-0 h-screen overflow-y-auto page-transition px-6 lg:px-10 pt-8 pb-16"
        }
      >
        {isEditor ? children : <div className="max-w-[960px]">{children}</div>}
      </main>
      <CommandPalette posts={posts} series={series} inEditor={inPostEditor} />
    </>
  );
}
