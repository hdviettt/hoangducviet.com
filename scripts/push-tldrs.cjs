// Push human-friendly TL;DRs (non-technical audience) to posts and projects.
// Run with --commit to apply; default is dry-run.
const { Pool } = require("pg");

const DRY_RUN = !process.argv.includes("--commit");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

const POST_TLDRS = {
  "building-a-mini-search-engine-1-web-crawling-in-search-engines":
    "If you've ever wondered how Google actually finds web pages in the first place — without already having a search engine to find them — this is the answer. The whole crawling process is a chicken-and-egg problem: you need URLs to find URLs. I walk through how it really works, why backlinks matter for getting your site discovered, and how I started my own mini search engine from just two seed URLs.",

  "building-a-mini-search-engine-2-designing-the-web-crawler":
    "How my web crawler actually works, in plain terms: it asks each website for permission (robots.txt), pretends to be a regular browser so it doesn't get blocked, and waits politely between requests so it doesn't crash the server. Useful if you've heard 'Google is crawling my site' and wondered what that actually means — and why some of your pages never get found.",

  "building-a-mini-search-engine-3-inverted-index":
    "When SEO advice says 'make sure your pages are indexed,' here's what that actually means. After crawling, search engines build a giant lookup table — a sort of upside-down index — that lets them find matching pages in milliseconds instead of reading every page from scratch every search. If your page isn't in that table, it's invisible, no matter how good the content is.",

  "building-a-mini-search-engine-4-ranking-with-bm25":
    "BM25 is the math underneath Google's earliest answer to 'which page is most relevant to this query?' Understanding it explains why long-tail keywords are easier to rank for, why mentioning a keyword 100 times stops helping past a point, and why a focused 2,000-word post can outrank a 10,000-word one — the basics of on-page SEO, derived from first principles instead of folklore.",

  "building-a-mini-search-engine-5-ranking-with-pagerank":
    "PageRank is the algorithm that put Google on the map: the idea that a page is important if other important pages link to it. Implementing it from scratch reveals why link building is core to SEO, why footer link spam doesn't work, why internal linking matters more than people think, and why a flat site architecture beats a deep one — all derived directly from the math.",

  "building-a-mini-search-engine-6-ai-overviews":
    "How AI Overviews actually works under the hood, and why it matters for SEO. It's not magic — it's retrieval-augmented generation. But it has one twist that gave SEO teams sleepless nights: the engine doesn't just look up your query, it expands it into several related queries first. Understanding this 'query fan-out' is half the work of optimizing for AI Overviews.",

  "building-a-mini-search-engine-7-neural-reranking-with-bert":
    "Why Google's 2019 BERT update changed search forever, in plain English. Before BERT, the engine treated 'Brazil traveler to USA' the same as 'USA traveler to Brazil' — small words like 'to' didn't matter. After BERT, they did. This is the foundation of why writing for the question-actually-being-asked beats keyword-stuffing, and it's why your content strategy probably needs to change.",

  "building-a-mini-search-engine-8-ai-mode":
    "Google's 2025 AI Mode is a stateful chat that lives inside Search — you can ask follow-up questions instead of starting over with new keywords every time. I built my own version on top of my mini search engine to understand the design choices behind it, especially the one I think matters most: why AI Mode stays inside the search results page rather than turning into a separate chatbot tab.",

  "agentic-keyword-clustering":
    "I built a tool that takes thousands of keywords and groups them into themes automatically — so SEO operators don't have to manually sort through spreadsheets for hours. The post covers what works, what breaks down (specifically: why throwing the whole list at ChatGPT falls apart past a few hundred keywords), and what the interface looks like for actually using these clusters in a content plan.",

  "liu-xiaopai-and-chinese-vibe-code-rush":
    "A profile of Liu Xiaopai, a former product manager who's making roughly $1M a year selling indie software — despite never being a 'real developer' and openly admitting his code is bad. The argument: in 2025, the bottleneck for shipping software has shifted from coding skill to problem-finding and speed of execution. What 50,000+ Chinese indie founders are quietly showing the rest of us about the next phase of building.",

  "the-chinese-ai-wisdom":
    "MIT's 2025 report says 95% of enterprise AI pilots fail to ship. Meanwhile in China, ByteDance's Doubao quietly hit 157 million monthly active users — by being woven into apps people already use every day (Douyin, Lark, Feishu), not by being a smarter standalone model. The thesis: the West is building AI products in isolation when it should be building AI INTO products. That's why the gap exists, and how to close it.",
};

const PROJECT_SUMMARIES = {
  "building-a-mini-search-engine":
    "I'm an SEO professional and I got tired of vague advice like 'write quality content' and 'build links'. I wanted to understand exactly how Google decides what ranks — not the principles, the actual math. So I built my own working search engine from scratch, end-to-end. This series is the result: every layer of how search actually works — crawling, indexing, ranking, AI Overviews, AI Mode — explained for non-technical readers, with the SEO implications spelled out at every step.",
};

(async () => {
  console.log(`${DRY_RUN ? "[DRY RUN]" : "[COMMIT]"} TL;DR push (non-technical voice)\n`);

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
