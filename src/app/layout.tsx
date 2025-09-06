import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

import { getGlobalMetadata } from "@/lib/directus";
import ClientFileExplorer from "@/components/ClientFileExplorer";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  return {
    title: "VIET",
    description: global.tagline || "Personal blog by Viet",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background text-foreground overflow-hidden">
        <GoogleAnalytics gaId="G-HKSHVM8Z9G" />
        <ClientFileExplorer>
          {children}
        </ClientFileExplorer>
      </body>
    </html>
  );
}
