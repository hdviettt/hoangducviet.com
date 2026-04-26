// Push human-sounding TL;DRs (no em-dashes, conversational, insight-first).
const { Pool } = require("pg");

const DRY_RUN = !process.argv.includes("--commit");
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false },
});

const POST_TLDRS = {
  "building-a-mini-search-engine-1-web-crawling-in-search-engines":
    "Google finds new pages by following links from pages it already knows about. That's why backlinks matter so much for SEO. If nothing on the web links to your site, Google has no way to discover it, and your content stays invisible. I started my own mini search engine from just two seed URLs: Wikipedia and OneFootball.",

  "building-a-mini-search-engine-2-designing-the-web-crawler":
    "A web crawler is a polite robot. It asks each website for permission via robots.txt, identifies itself as a browser so it doesn't get blocked, and waits between requests so it doesn't crash anything. I walk through how mine works under the hood, and explain why some pages on your site might never get found.",

  "building-a-mini-search-engine-3-inverted-index":
    "When SEO advice says 'make sure your pages are indexed,' it means your pages need to be in Google's giant word-to-pages lookup table. Every search runs against that table. If your page isn't in it, no one finds you, no matter how good the writing is. Here's how that table actually gets built.",

  "building-a-mini-search-engine-4-ranking-with-bm25":
    "BM25 is the math behind how Google decides which page is most relevant to a query. Once you understand it, a lot of SEO advice stops feeling like folklore. You can see why long-tail keywords are easier to rank for, why repeating a keyword 100 times stops helping, and why a focused 2,000-word post can outrank a 10,000-word one.",

  "building-a-mini-search-engine-5-ranking-with-pagerank":
    "PageRank's idea is simple. A page is important if other important pages link to it. The math behind it explains a lot of what SEO experts care about: why link building actually matters, why footer link spam never works, why internal linking is more powerful than most people realize, and why a flat site beats a deep one.",

  "building-a-mini-search-engine-6-ai-overviews":
    "AI Overviews doesn't just look up your search query. It first expands your query into several related questions, then writes an answer using results from all of them. This 'query fan-out' step is half the work of optimizing for AI Overviews. It's also the part that gave SEO teams sleepless nights when it launched.",

  "building-a-mini-search-engine-7-neural-reranking-with-bert":
    "Before Google's 2019 BERT update, 'Brazil traveler to USA' and 'USA traveler to Brazil' meant the same thing to Search. After BERT, they didn't. Tiny words like 'to' suddenly carried meaning. That was the moment when writing for the actual question someone is asking started beating keyword-stuffing for good.",

  "building-a-mini-search-engine-8-ai-mode":
    "Google's AI Mode lets you have a real conversation with Search. Ask a question, get an answer, ask a follow-up, no need to restart with new keywords. The most important design choice they made: AI Mode lives inside the search results page, not in a separate chatbot tab. I built my own version to understand why that matters.",

  "agentic-keyword-clustering":
    "How to group thousands of keywords into themes automatically, so SEO operators don't have to manually sort through spreadsheets for hours. What works in practice, what breaks at scale (throwing the whole list at ChatGPT falls apart past a few hundred keywords), and what the actual interface looks like for using these clusters in a content plan.",

  "liu-xiaopai-and-chinese-vibe-code-rush":
    "The bottleneck for shipping software in 2025 isn't coding skill anymore. It's problem-finding and execution speed. Liu Xiaopai is the proof. He's a former product manager making roughly $1M a year on indie software built with Claude Code, and he openly admits his code is bad. There are over 50,000 Chinese indie founders showing the rest of us what the next phase of building looks like.",

  "the-chinese-ai-wisdom":
    "The Chinese AI playbook, in one line: don't build a smarter standalone AI, weave AI into apps people already use every day. ByteDance's Doubao reached 157 million monthly active users by integrating into Douyin, Lark, and Feishu. It didn't try to compete on model capability. Meanwhile, MIT's 2025 report shows 95% of Western enterprise AI pilots fail to reach production. The gap isn't smarter models. It's distribution and integration.",
};

const PROJECT_SUMMARIES = {
  "building-a-mini-search-engine":
    "A working search engine I built from scratch, going through all eight layers: crawling, indexing, ranking, AI Overviews, AI Mode. I didn't build it to compete with Google. I built it to understand how Google's SEO mechanics actually work from first principles. Each post in the series explains one layer for non-technical readers, with the SEO implications spelled out clearly.",
};

(async () => {
  console.log(`${DRY_RUN ? "[DRY RUN]" : "[COMMIT]"} TL;DR push (human voice, no em-dashes)\n`);

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
