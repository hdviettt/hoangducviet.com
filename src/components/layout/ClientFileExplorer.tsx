"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import FileExplorer from "./FileExplorer";

export default function ClientFileExplorer({
  children,
}: { children: ReactNode }) {
  const pathname = usePathname();

  // Admin pages render without the blog shell
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <FileExplorer>{children}</FileExplorer>;
}
