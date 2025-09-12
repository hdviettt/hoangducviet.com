import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

import { getGlobalMetadata } from "@/lib/directus";
import ClientFileExplorer from "@/components/ClientFileExplorer";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const siteTitle = global && global.length > 0 ? global[0].title : "Blog";
  const siteTagline = global && global.length > 0 ? global[0].tagline : "Personal blog by Viet";
  return {
    title: siteTitle,
    description: siteTagline,
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
