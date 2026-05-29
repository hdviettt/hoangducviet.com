const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://hoangducviet.com";

export const dynamic = "force-static";

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# IETF Content Signals — declare AI-usage policy
# https://www.ietf.org/archive/id/draft-ietf-aipref-content-usage-00.html
Content-Signal: search=yes, ai-input=yes, ai-train=no

User-agent: GPTBot
Content-Signal: ai-train=no

User-agent: ClaudeBot
Content-Signal: ai-train=no

User-agent: PerplexityBot
Content-Signal: ai-input=yes

User-agent: CCBot
Disallow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
