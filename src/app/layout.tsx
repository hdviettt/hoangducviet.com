import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

import { getGlobalMetadata } from "@/lib/directus";
import ClientFileExplorer from "@/components/ClientFileExplorer";
import { PostHogProvider } from "@/components/PostHogProvider";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const siteTitle = global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
  const siteTagline = global && global.length > 0 ? global[0].tagline : "Hoang Duc Viet's personal blog";
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
    <html lang="en" className="overflow-x-hidden">
      <body className="antialiased min-h-screen bg-background text-foreground overflow-hidden overflow-x-hidden">
        <GoogleAnalytics gaId="G-HKSHVM8Z9G" />
        <PostHogProvider>
          <ClientFileExplorer>
            {children}
          </ClientFileExplorer>
        </PostHogProvider>
      </body>
    </html>
  );
}