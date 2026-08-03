/**
 * Publish (or update) the mini-reranker post.
 *
 * Upserts on slug so rerunning is safe: it will not create a second row and it
 * will not reset date_created on a post that already exists.
 *
 *   railway run --service database node scripts/push-mini-reranker-post.cjs [--publish]
 *
 * Without --publish it writes the row as a draft, which renders at the URL for
 * anyone who knows it and stays off the index.
 */
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const SLUG = "i-wrote-a-transformer-by-hand";
const TITLE = "I tried to train a cross-encoder from scratch and it sucked";
// Under 160 characters, because past that Google truncates it mid-sentence.
const DESCRIPTION =
  "I rebuilt my search engine's cross-encoder from scratch. It barely beat counting keywords, and my evaluation turned out to be measuring keyword overlap.";
const THUMBNAIL = "/covers/i-wrote-a-transformer-by-hand.svg";
const SOURCE = path.join(
  __dirname,
  "..",
  "..",
  "mini-reranker",
  "docs",
  "posts",
  "01-i-wrote-a-transformer-by-hand.md",
);

const publish = process.argv.includes("--publish");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  let content = fs.readFileSync(SOURCE, "utf8");

  // The CMS renders the title from the `title` column and shows it above the
  // body, so a leading H1 in the markdown would print it twice.
  content = content.replace(/^#\s.*\n+/, "");

  if (DESCRIPTION.length > 160) {
    throw new Error(`description is ${DESCRIPTION.length} chars, over the 160 limit`);
  }

  const { rows } = await pool.query(
    `INSERT INTO posts (slug, title, description, content, thumbnail, status, date_updated)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title,
       description = EXCLUDED.description,
       content = EXCLUDED.content,
       thumbnail = EXCLUDED.thumbnail,
       status = EXCLUDED.status,
       date_updated = NOW()
     RETURNING id, slug, status, length(content) AS chars`,
    [SLUG, TITLE, DESCRIPTION, content, THUMBNAIL, publish ? "published" : "draft"],
  );

  const r = rows[0];
  console.log(`  ${r.status.padEnd(9)} id=${r.id}  ${r.chars} chars  /posts/${r.slug}`);
  console.log(`  description ${DESCRIPTION.length}/160 chars`);
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
