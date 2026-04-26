// Push TL;DRs that lead with the insight, not the storytelling.
const { Pool } = require("pg");

const DRY_RUN = !process.argv.includes("--commit");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

const POST_TLDRS = {
  "building-a-mini-search-engine-1-web-crawling-in-search-engines":
    "Google finds new pages by following links from pages it already knows — which is why backlinks are the difference between findable and invisible. The crawl is a chicken-and-egg problem, solved by starting from a small list of seed URLs and propagating outward. I started my mini search engine from two seeds: Wikipedia and OneFootball.",

  "building-a-mini-search-engine-2-designing-the-web-crawler":
    "A web crawler is a polite robot: it asks permission via robots.txt, identifies itself as a browser, and waits between requests so it doesn't get blocked. I walk through the architecture of mine — the parts that fetch, parse, and orchestrate the crawl — and why some pages on a site might never get found.",

  "building-a-mini-search-engine-3-inverted-index":
    "'Make sure your pages are indexed' means your pages are in a giant word-to-pages lookup table that powers every search. If your page isn't in that table, it's invisible — no matter how good the content. How that table is actually built, and the line between findable and unfindable.",

  "building-a-mini-search-engine-4-ranking-with-bm25":
    "BM25 is the original math behind 'which page is most relevant?' It's why long-tail keywords are easier to rank for, why mentioning a keyword 100 times stops helping, and why a focused 2,000-word post can beat a 10,000-word one. On-page SEO basics, derived from first principles instead of folklore.",

  "building-a-mini-search-engine-5-ranking-with-pagerank":
    "PageRank: a page is important if other important pages link to it. The math behind why link building matters for SEO, why footer link spam doesn't work, why internal linking is more powerful than people realize, and why a flat site architecture beats a deep one.",

  "building-a-mini-search-engine-6-ai-overviews":
    "AI Overviews doesn't just look up your query — it expands it into several related queries first, then synthesizes an answer from all of them. This 'query fan-out' is half the work of optimizing for AI Overviews, and it's the part that gave SEO teams sleepless nights when it launched.",

  "building-a-mini-search-engine-7-neural-reranking-with-bert":
    "Before Google's 2019 BERT update, 'Brazil traveler to USA' and 'USA traveler to Brazil' meant the same thing to Search. After BERT, they didn't. Small words like 'to' suddenly mattered, and writing for the question actually being asked started beating keyword-stuffing for good.",

  "building-a-mini-search-engine-8-ai-mode":
    "Google's AI Mode lets you have a conversation with Search instead of restarting with new keywords every time. The most important design choice: it lives inside the search results page, not in a separate chatbot tab. I built my own version on top of my mini search engine to understand why.",

  "agentic-keyword-clustering":
    "How to group thousands of keywords into themes automatically, so SEO operators don't manually sort spreadsheets for hours. What works (embeddings + UMAP + HDBSCAN), what breaks (throwing the whole list at ChatGPT past a few hundred keywords), and the interface for actually using these clusters in a content plan.",

  "liu-xiaopai-and-chinese-vibe-code-rush":
    "The bottleneck for shipping software in 2025 isn't coding skill — it's problem-finding and execution speed. Liu Xiaopai is the proof: a former product manager making ~$1M/year on indie software with Claude Code, while openly admitting his code is bad. What 50,000+ Chinese indie founders are showing the rest of us about the next phase of building.",

  "the-chinese-ai-wisdom":
    "The Chinese AI playbook in one line: don't build a smarter standalone AI, weave AI into apps people already use every day. ByteDance's Doubao reached 157M monthly active users through Douyin, Lark, and Feishu — not by competing on model capability. MIT's 2025 report shows 95% of Western enterprise AI pilots fail to ship. The gap isn't smarter models; it's distribution and integration.",
};

const PROJECT_SUMMARIES = {
  "building-a-mini-search-engine":
    "A working search engine built from scratch — crawling, indexing, ranking, AI Overviews, AI Mode — to understand how Google's SEO mechanics actually work from first principles. Eight parts. Each layer explained for non-technical readers, with the SEO implications spelled out at every step.",
};

(async () => {
  console.log(`${DRY_RUN ? "[DRY RUN]" : "[COMMIT]"} TL;DR push (insight-first)\n`);

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
