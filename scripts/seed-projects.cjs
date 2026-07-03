// Seed the projects table with real projects. Idempotent: ON CONFLICT DO
// NOTHING, so re-running never clobbers edits made later in /admin/work.
//
// Usage: railway run --service database node scripts/seed-projects.cjs

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PROJECTS = [
  {
    slug: "mini-search-engine",
    title: "Mini Search Engine",
    tagline:
      "A working search engine built from scratch — web crawler, inverted index, BM25, PageRank, neural reranking with BERT, and AI-mode retrieval. The code behind the series.",
    repo: "https://github.com/hdviettt/mini-search-engine",
    tech: ["Python"],
    build: "live",
    featured: true,
    sort: 1,
    posts: [
      "web-crawling-in-search-engines",
      "designing-the-web-crawler",
      "inverted-index",
      "ranking-with-bm25",
      "ranking-with-pagerank",
      "ai-overviews",
      "neural-reranking-with-bert",
      "ai-mode",
    ],
  },
  {
    slug: "vn-aio-atlas",
    title: "VN-AIO Atlas",
    tagline:
      "Maps where and how Google AI Overviews surface across Vietnamese search — a data atlas of the generative-search surface.",
    repo: "https://github.com/hdviettt/vn-aio-atlas",
    tech: ["Python"],
    build: "live",
    featured: false,
    sort: 2,
    posts: [],
  },
  {
    slug: "vn-aio-predictor",
    title: "VN-AIO Predictor",
    tagline:
      "Predicts whether a Vietnamese query triggers an AI Overview and what gets cited — GEO forecasting from real SERP data.",
    repo: "https://github.com/hdviettt/vn-aio-predictor",
    tech: ["Python"],
    build: "wip",
    featured: false,
    sort: 3,
    posts: [],
  },
  {
    slug: "vn-aio-simulator",
    title: "VN-AIO Simulator",
    tagline:
      "Simulates how AI Overviews assemble and cite sources, to test what content actually earns a citation.",
    repo: "https://github.com/hdviettt/vn-aio-simulator",
    tech: ["Python"],
    build: "wip",
    featured: false,
    sort: 4,
    posts: [],
  },
  {
    slug: "mini-google-ads",
    title: "Mini Google Ads",
    tagline:
      "An ad auction and ranking system built from scratch — bidding, quality score, and ad rank, the way search ads actually work.",
    repo: "https://github.com/hdviettt/mini-google-ads",
    tech: ["Python"],
    build: "live",
    featured: false,
    sort: 5,
    posts: [],
  },
];

(async () => {
  const postRows = await pool.query("SELECT slug FROM posts");
  const existing = new Set(postRows.rows.map((r) => r.slug));

  for (const p of PROJECTS) {
    await pool.query(
      `INSERT INTO projects
         (slug, title, tagline, repo_url, tech_tags, status, build_status, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,'published',$6,$7,$8)
       ON CONFLICT (slug) DO NOTHING`,
      [p.slug, p.title, p.tagline, p.repo, p.tech, p.build, !!p.featured, p.sort],
    );

    for (const ps of p.posts) {
      if (!existing.has(ps)) {
        console.log(`  ! skip missing post: ${ps}`);
        continue;
      }
      await pool.query(
        `INSERT INTO project_posts (project_slug, post_slug) VALUES ($1,$2)
         ON CONFLICT DO NOTHING`,
        [p.slug, ps],
      );
    }
    console.log(`seeded: ${p.slug} (${p.posts.length} linked posts)`);
  }

  const c = await pool.query("SELECT count(*)::int AS n FROM projects");
  console.log(`\ntotal projects in DB: ${c.rows[0].n}`);
  await pool.end();
})().catch((e) => {
  console.error("SEED FAILED:", e.message);
  process.exit(1);
});
