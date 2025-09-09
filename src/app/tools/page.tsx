import Link from "next/link";
import { getTools } from "@/lib/get-tools";

export default async function ToolsPage() {
  const tools = await getTools();
  
  // Separate tools by status
  const publishedTools = tools.filter(tool => tool.status === "published");
  const comingSoonTools = tools.filter(tool => tool.status === "coming_soon");
  const draftTools = tools.filter(tool => tool.status === "draft");

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full p-4 md:p-8 lg:p-16 animate-fadeIn">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground uppercase">
              Professional Tools
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-mono">
              [Utilities for SEO, content creation, and digital marketing]
            </p>
          </div>

          {/* Available Tools */}
          {publishedTools.length > 0 && (
            <div className="mb-12 md:mb-16">
              <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold mb-4">
                Available Tools [{publishedTools.length}]
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {publishedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group border-2 border-white bg-black hover:bg-white hover:text-black transition-all duration-200"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm md:text-base font-bold uppercase">
                          {tool.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-current">
                          Active
                        </span>
                      </div>
                      <p className="text-xs md:text-sm mb-3 opacity-80">
                        {tool.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase">
                          [SEO]
                        </span>
                        <span className="text-[10px] font-mono group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon */}
          {comingSoonTools.length > 0 && (
            <div>
              <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold mb-4">
                Coming Soon [{comingSoonTools.length}]
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {comingSoonTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="border-2 border-white/30 bg-black/50 opacity-50 cursor-not-allowed"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm md:text-base font-bold uppercase text-white/70">
                          {tool.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-white/30 text-white/50">
                          Soon
                        </span>
                      </div>
                      <p className="text-xs md:text-sm mb-3 text-white/50">
                        {tool.description}
                      </p>
                      <span className="text-[10px] font-mono uppercase text-white/40">
                        [SEO]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 md:mt-16 pt-8 border-t-2 border-white/20">
            <p className="text-xs font-mono text-muted-foreground text-center">
              [More tools coming soon] • [Have a suggestion?]{" "}
              <Link href="/contact" className="text-white hover:underline">
                Contact
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}