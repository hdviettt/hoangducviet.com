"use client";

import FileExplorer from "./FileExplorer";
import { ReactNode } from "react";

export default function ClientFileExplorer({ children }: { children: ReactNode }) {
  return <FileExplorer>{children}</FileExplorer>;
}