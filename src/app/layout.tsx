import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

import { getGlobalMetadata } from "@/lib/directus";
import ClientFileExplorer from "@/components/ClientFileExplorer";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const siteTitle = global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
  const siteTagline = global && global.length > 0 ? global[0].tagline : "Hoang Duc Viet's personal blog";
  return {
    title: siteTitle,
    description: siteTagline,
  }
}

// Script to prevent theme flash - runs before React hydration
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} overflow-x-hidden`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground overflow-hidden overflow-x-hidden font-sans">
        <GoogleAnalytics gaId="G-HKSHVM8Z9G" />
        <ThemeProvider>
          <PostHogProvider>
            <ClientFileExplorer>
              {children}
            </ClientFileExplorer>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}