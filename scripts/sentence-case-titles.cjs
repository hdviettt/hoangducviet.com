/**
 * Rewrite post titles from Title Case to sentence case.
 *
 *   railway run --service database node scripts/sentence-case-titles.cjs [--write]
 *
 * The mapping is written out rather than computed. An algorithm has to decide
 * what PageRank, BM25, CMS-Adaptable, SEONGON and "vibe code rush" are, and
 * every rule that gets one right gets another wrong. Nineteen titles is small
 * enough to be exact and reviewable.
 *
 * Dry run by default. Only touches rows whose current title matches `from`, so
 * a second run is a no-op and a title edited in the CMS meanwhile is skipped
 * rather than clobbered.
 */
const { Pool } = require("pg");

const RENAMES = [
  ["The Chinese AI Integration Wisdom",
   "The Chinese AI integration wisdom"],
  ['Liu Xiaopai and the Chinese "Vibe Code Rush"',
   'Liu Xiaopai and the Chinese "vibe code rush"'],
  ["An ML and LLM Pipeline for Keyword Clustering in SEO",
   "An ML and LLM pipeline for keyword clustering in SEO"],
  ["Building a Mini Search Engine #1: Web Crawling in Search Engines",
   "Building a mini search engine #1: web crawling in search engines"],
  ["Building a Mini Search Engine #2: Designing the Web Crawler",
   "Building a mini search engine #2: designing the web crawler"],
  ["Building a Mini Search Engine #3: Inverted Index",
   "Building a mini search engine #3: the inverted index"],
  ["Building a Mini Search Engine #4: Ranking with BM25",
   "Building a mini search engine #4: ranking with BM25"],
  ["Building a Mini Search Engine #5: Ranking with PageRank",
   "Building a mini search engine #5: ranking with PageRank"],
  ["Building a Mini Search Engine #6: AI Overviews",
   "Building a mini search engine #6: AI Overviews"],
  ["Building a Mini Search Engine #7: Neural Reranking with BERT",
   "Building a mini search engine #7: neural reranking with BERT"],
  ["Building a Mini Search Engine #8: AI Mode",
   "Building a mini search engine #8: AI Mode"],
  ["Building a Mini Search Engine #9: Measuring Search Quality",
   "Building a mini search engine #9: measuring search quality"],
  ["Why Our AI Team Failed",
   "Why our AI team failed"],
  ["An Artifact-Driven AI Initiative Blueprint",
   "An artifact-driven AI initiative blueprint"],
  ["A Brief History of SEO Content Writing with AI",
   "A brief history of SEO content writing with AI"],
  ["A CMS-Adaptable LLM Pipeline for SEO-Compliant Content Publishing",
   "A CMS-adaptable LLM pipeline for SEO-compliant content publishing"],
  ["The Less Agentic the Agent, the Better",
   "The less agentic the agent, the better"],
  ["An Agent Platform for SEONGON, Built Around Human Procedures",
   "An agent platform for SEONGON, built around human procedures"],
];

const write = process.argv.includes("--write");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  let changed = 0;
  let skipped = 0;

  for (const [from, to] of RENAMES) {
    const { rows } = await pool.query(
      "SELECT slug, title FROM posts WHERE title = $1",
      [from],
    );
    if (!rows.length) {
      console.log(`  skip   no row titled ${JSON.stringify(from)}`);
      skipped++;
      continue;
    }
    console.log(`  ${rows[0].slug}`);
    console.log(`    -  ${from}`);
    console.log(`    +  ${to}`);
    changed++;
    if (write) {
      await pool.query(
        "UPDATE posts SET title = $1, date_updated = NOW() WHERE title = $2",
        [to, from],
      );
    }
  }

  const { rows: rest } = await pool.query(
    "SELECT slug, title FROM posts ORDER BY date_created",
  );
  // A title with an interior capitalised word that is not an acronym or a name
  // is one this pass missed.
  const suspects = rest.filter((r) =>
    r.title
      .split(/[\s:]+/)
      .slice(1)
      .some((w) => /^[A-Z][a-z]{2,}/.test(w) &&
        !["Overviews", "Mode", "PageRank", "Liu", "Xiaopai", "Chinese", "Building"].includes(w)));

  console.log(`\n  ${changed} to change, ${skipped} not found`);
  if (suspects.length) {
    console.log("  still title-cased, check by hand:");
    for (const s of suspects) console.log(`    ${s.title}`);
  }
  if (!write) console.log("\n  dry run, pass --write to apply");
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
