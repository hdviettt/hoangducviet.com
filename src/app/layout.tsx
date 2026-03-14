import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { PostHogProvider } from "@/components/PostHogProvider";
import { getGlobalMetadata } from "@/lib/global";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const global = await getGlobalMetadata();
  const siteTitle =
    global && global.length > 0 ? global[0].title : "Hoang Duc Viet";
  const siteTagline =
    global && global.length > 0
      ? global[0].tagline
      : "Hoang Duc Viet's personal blog";
  return {
    title: siteTitle,
    description: siteTagline,
    icons: {
      icon: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="antialiased bg-white text-neutral-900">
        <GoogleAnalytics gaId="G-HKSHVM8Z9G" />
        <PostHogProvider>
          <div className="max-w-2xl mx-auto px-6 py-10">
            <header className="mb-10">
              <Link href="/" className="text-xl font-semibold hover:no-underline">
                Hoang Duc Viet
              </Link>
              <nav className="mt-2 text-sm text-neutral-500 flex gap-4">
                <Link href="/" className="hover:text-neutral-900">blog</Link>
                <Link href="/projects" className="hover:text-neutral-900">projects</Link>
              </nav>
            </header>
            <main>{children}</main>
          </div>
        </PostHogProvider>
      </body>
    </html>
  );
}
