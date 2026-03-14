"use client";

import type { ReactNode } from "react";
import FileExplorer from "./FileExplorer";

export default function ClientFileExplorer({
  children,
}: { children: ReactNode }) {
  return <FileExplorer>{children}</FileExplorer>;
}
