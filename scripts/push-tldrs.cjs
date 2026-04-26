// Push longer, more substantive TL;DRs to posts and projects in prod.
// Run with --commit to apply; default is dry-run.
const { Pool } = require("pg");

const DRY_RUN = !process.argv.includes("--commit");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

const POST_TLDRS = {
  "building-a-mini-search-engine-1-web-crawling-in-search-engines":
    "Search engines need URLs to crawl, but where do those URLs come from in the first place — a chicken-and-egg problem. I cover how a crawl bootstraps from seed URLs (Wikipedia, OneFootball), why BFS beats DFS for relevance, why backlinks matter for reach, and how I started building a football mini search engine from two seeds.",

  "building-a-mini-search-engine-2-designing-the-web-crawler":
    "The actual architecture of the crawler: a Fetcher that respects robots.txt and User-Agent rules, a Parser that strips noise and normalizes URLs, and a Manager that runs BFS over a Postgres-backed queue. Plus the safety mechanisms — depth limits, rate limiting, content-type checks, deduplication — that keep it from hammering servers or eating storage.",

  "building-a-mini-search-engine-3-inverted-index":
    "After crawling 1,000 pages, the question becomes how to find matches across all of them in milliseconds. Forward indexes scale linearly; inverted indexes flip the structure to map words → pages, turning every search into a single dictionary lookup. I cover tokenization, term frequency tracking, document length stats, and how this connects directly to Google's 'make sure your pages are indexed' SEO guidance.",

  "building-a-mini-search-engine-4-ranking-with-bm25":
    "BM25 is the relevance-scoring algorithm Google started from, and it's still the foundation under modern search. I break down its three components — term frequency saturation, inverse document frequency, and length normalization — with the actual math, and show why long-tail keywords have higher IDF and are mathematically easier to rank for. Plus how Google has evolved beyond BM25 with semantic models, user signals, and entity matching.",

  "building-a-mini-search-engine-5-ranking-with-pagerank":
    "PageRank is the algorithm that made Google: a page is important if important pages link to it. I implement it from scratch — building the link graph in Postgres, iterating with the standard formula, handling dangling nodes — and explain how the math behind link contributions, the random surfer, and the damping factor translates directly into SEO advice on link building, internal linking, and flat site architectures.",

  "building-a-mini-search-engine-6-ai-overviews":
    "AI Overviews is one of the most subtle yet life-changing features of the modern internet. Under the hood it's Retrieval-Augmented Generation on top of hybrid search — keyword match + vector search. I walk through chunking, vector embeddings via Voyage AI, the 'query fan-out' step that gave SEOers headaches, and the gaps I want to address next: specialized models per pipeline step and grounding fan-out in real search demand.",

  "building-a-mini-search-engine-7-neural-reranking-with-bert":
    "Google's 2019 BERT update was the biggest search-quality improvement in a decade because the model finally understood context bidirectionally — words like 'to' that completely flip query intent. I use a small ms-marco-MiniLM cross-encoder to rerank my top BM25+PageRank candidates by semantic relevance, explain how cross-encoders differ from the bi-encoders used for vector retrieval, and what this all means for keyword-spam SEO going forward.",

  "building-a-mini-search-engine-8-ai-mode":
    "Google's 2025 AI Mode lets users have a stateful search journey instead of scattered keyword searches. I built my own version on top of my mini search engine, with one design constraint: it has to live inside the SERP, not in a dedicated tab. I cover building a custom web_search tool grounded in my own crawled data instead of cheating with an LLM provider's built-in search, and why I chose not to persist conversation history.",

  "agentic-keyword-clustering":
    "How I built a keyword clustering tool for Vietnamese SEO using embeddings, UMAP for dimensionality reduction, and HDBSCAN for density-based clustering. Covers the parameter choices that actually matter at scale (and why naive LLM-driven clustering breaks down past a few hundred keywords), plus the UI/UX decisions for surfacing clusters back to SEO operators in a way they can act on.",

  "liu-xiaopai-and-chinese-vibe-code-rush":
    "Liu Xiaopai built ~$1M/year in indie revenue using Claude Code + Cursor, despite his own admission that his code is 'terrible.' He's not a developer; he's a former product manager. The post argues the real bottleneck has shifted from code quality to problem-finding and execution speed, and unpacks what 50,000+ Chinese indie devs on Xiaohongshu are doing differently — and what that signals about the next phase of software building.",

  "the-chinese-ai-wisdom":
    "MIT's 2025 report shows 95% of enterprise GenAI pilots fail to reach production. Meanwhile Chinese AI products like ByteDance's Doubao quietly hit 157M MAU — by embedding AI into platforms users already inhabit (Lark, Douyin, Feishu), not by building smarter standalone models. The thesis: integration depth beats model capability, and the Western 'pilot in isolation' approach is structurally why it stalls.",
};

const PROJECT_SUMMARIES = {
  "building-a-mini-search-engine":
    "A football search engine that replicates Google's core search infrastructure end-to-end — web crawling, inverted indexing, BM25 + PageRank ranking, BERT neural reranking, AI Overviews via RAG, and a stateful AI Mode. Built solo, in eight parts, to understand search ranking from inside an SEO professional's mind.",
};

(async () => {
  console.log(`${DRY_RUN ? "[DRY RUN]" : "[COMMIT]"} TL;DR push\n`);

  for (const [slug, newDesc] of Object.entries(POST_TLDRS)) {
    const cur = await pool.query(
      "SELECT description FROM posts WHERE slug = $1",
      [slug],
    );
    if (cur.rows.length === 0) {
      console.log(`SKIP ${slug}: not found`);
      continue;
    }
    const before = cur.rows[0].description || "";
    if (before === newDesc) {
      console.log(`unchanged: ${slug}`);
      continue;
    }
    console.log(`${slug}`);
    console.log(`  before (${before.length}): ${before}`);
    console.log(`  after  (${newDesc.length}): ${newDesc}`);
    if (!DRY_RUN) {
      await pool.query(
        "UPDATE posts SET description = $1, date_updated = NOW() WHERE slug = $2",
        [newDesc, slug],
      );
      console.log("  UPDATED");
    }
    console.log("");
  }

  for (const [slug, newSum] of Object.entries(PROJECT_SUMMARIES)) {
    const cur = await pool.query(
      "SELECT summary FROM projects WHERE slug = $1",
      [slug],
    );
    if (cur.rows.length === 0) {
      console.log(`SKIP project ${slug}: not found`);
      continue;
    }
    const before = cur.rows[0].summary || "";
    if (before === newSum) {
      console.log(`project unchanged: ${slug}`);
      continue;
    }
    console.log(`project ${slug}`);
    console.log(`  before (${before.length}): ${before}`);
    console.log(`  after  (${newSum.length}): ${newSum}`);
    if (!DRY_RUN) {
      await pool.query(
        "UPDATE projects SET summary = $1, date_updated = NOW() WHERE slug = $2",
        [newSum, slug],
      );
      console.log("  UPDATED");
    }
    console.log("");
  }

  await pool.end();
  if (DRY_RUN) {
    console.log("Dry run only. Re-run with --commit to apply.");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
