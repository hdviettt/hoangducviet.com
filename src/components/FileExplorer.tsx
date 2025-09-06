import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface FileExplorerProps {
  children: ReactNode;
  title?: string;
}

export default function FileExplorer({ children, title = "VIET" }: FileExplorerProps) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex items-center justify-center bg-background overflow-hidden p-2 md:p-6">
      <div className="w-full max-w-5xl h-full md:h-[600px]">
        {/* Brutalist File Explorer Window */}
        <div className="h-full window flex flex-col border-2 md:border-4 border-white">

          {/* Title Bar - Flat Brutalist */}
          <div className="bg-black px-2 md:px-3 py-1.5 md:py-2 flex items-center justify-between border-b md:border-b-2 border-white">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-3 h-3 bg-white hover:bg-gray-300 transition-colors cursor-pointer" />
                <div className="w-3 h-3 bg-white hover:bg-gray-300 transition-colors cursor-pointer" />
                <div className="w-3 h-3 bg-white hover:bg-gray-300 transition-colors cursor-pointer" />
              </div>
              <div className="text-xs text-white font-bold uppercase tracking-wider">
                {title}
              </div>
            </div>
          </div>

          {/* Path Bar */}
          <div className="bg-black px-2 md:px-3 py-1 flex items-center border-b md:border-b-2 border-white">
            <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-[10px] text-white font-mono">
              <span className="hover:underline cursor-pointer">~/portfolio</span>
              <span>/</span>
              <span className="font-bold">
                {pathname === "/" ? "about" :
                  pathname.startsWith("/posts") ? "articles" :
                    pathname.startsWith("/projects") ? "projects" :
                      pathname.slice(1)}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Brutalist */}
            <div className="hidden md:block w-36 bg-black border-r-2 border-white flex-shrink-0 overflow-y-auto">
              <div className="p-2">
                <div className="text-[9px] text-white mb-2 px-1 font-bold uppercase tracking-wider border-b border-white pb-1">
                  Files
                </div>

                <div className="space-y-0">
                  {/* About */}
                  <Link
                    href="/"
                    className={`block px-2 py-1.5 text-[11px] font-mono transition-colors ${pathname === "/"
                      ? "bg-white text-black font-bold"
                      : "text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    about.md
                  </Link>

                  {/* Projects */}
                  <Link
                    href="/projects"
                    className={`block px-2 py-1.5 text-[11px] font-mono transition-colors ${pathname.startsWith("/projects")
                      ? "bg-white text-black font-bold"
                      : "text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    projects/
                  </Link>

                  {/* Articles */}
                  <Link
                    href="/posts"
                    className={`block px-2 py-1.5 text-[11px] font-mono transition-colors ${pathname.startsWith("/posts")
                      ? "bg-white text-black font-bold"
                      : "text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    articles/
                  </Link>
                </div>

                {/* Links Section */}
                <div className="mt-4 pt-3 border-t border-white">
                  <div className="text-[9px] text-white mb-2 px-1 font-bold uppercase tracking-wider">
                    External
                  </div>
                  <div className="space-y-0">
                    <a
                      href="https://www.facebook.com/hoangducviettt/"
                      className="block px-2 py-1.5 text-[11px] font-mono text-white hover:bg-white hover:text-black transition-colors"
                    >
                      [facebook]
                    </a>
                    <a
                      href="https://www.instagram.com/_hdviet/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-2 py-1.5 text-[11px] font-mono text-white hover:bg-white hover:text-black transition-colors"
                    >
                      [instagram]
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-black overflow-y-auto">
              {/* Mobile Navigation */}
              <div className="md:hidden bg-black border-b-2 border-white">
                <div className="flex justify-around p-2">
                  <Link
                    href="/"
                    className={`px-3 py-1.5 text-[10px] font-mono transition-colors ${pathname === "/"
                      ? "bg-white text-black font-bold"
                      : "text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    about
                  </Link>
                  <Link
                    href="/projects"
                    className={`px-3 py-1.5 text-[10px] font-mono transition-colors ${pathname.startsWith("/projects")
                      ? "bg-white text-black font-bold"
                      : "text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    projects
                  </Link>
                  <Link
                    href="/posts"
                    className={`px-3 py-1.5 text-[10px] font-mono transition-colors ${pathname.startsWith("/posts")
                      ? "bg-white text-black font-bold"
                      : "text-white hover:bg-white hover:text-black"
                      }`}
                  >
                    articles
                  </Link>
                </div>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}