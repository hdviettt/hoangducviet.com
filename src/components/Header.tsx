import { Github } from "lucide-react";
import Link from "next/link";

import { getGlobalMetadata } from "@/lib/directus";
import { getPages } from "@/lib/pages";

import Container from "@/components/Container";

async function Header() {
  let title = "VIET";
  let pages: any[] = [];
  
  try {
    const metadata = await getGlobalMetadata();
    title = metadata.title || "VIET";
  } catch (error) {
    console.error("Error fetching global metadata:", error);
  }
  
  try {
    pages = await getPages({
      fields: ["title", "slug", "navigation"],
      filter: {
        navigation: {
          _eq: "yes"
        } 
      }
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    pages = [];
  }
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-black tracking-tight hover:opacity-80 transition-opacity">
              VIET
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <ul className="flex items-center gap-6 text-sm">
              {pages.map(({ title, slug }) => {
                return (
                  <li key={slug}>
                    <Link 
                      href={`/${slug}`} 
                      className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
                    >
                      {title}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link 
                  href="/posts" 
                  className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link 
                  href="/projects" 
                  className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  Projects
                </Link>
              </li>
            </ul>
            <div className="h-4 w-px bg-border" />
            <a 
              href="https://github.com/colbyfayock/test-directus-blog" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </nav>
        </div>
      </Container>
    </header>
  );
}

export default Header;
