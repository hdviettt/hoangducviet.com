/**
 * Add the correction note to post 9, in place.
 *
 *   railway run --service database node scripts/add-post9-correction.cjs [--write]
 *
 * Reads the live content and inserts the note after the TL;DR, rather than
 * pushing the copy from the search-engine repository. Those two have diverged:
 * the published TL;DR was rewritten in the CMS and the repository never caught
 * up, so replacing the row wholesale would silently revert it.
 *
 * Idempotent. Running twice does not add the note twice.
 */
const { Pool } = require("pg");

const SLUG = "measuring-search-quality";
const MARKER = "the ruler in this post is bent";

const NOTE = `> **Update, months later: the ruler in this post is bent, and I want to say so before you read the numbers.**
>
> I built a second project that needed a trustworthy way to compare two rerankers, and it used this evaluation. The first thing it found was that a five-line function which counts query words in the title scores **0.7551** here. That beats the entire pipeline this post measures at 0.7394.
>
> The reason is in the labels. I graded a result by checking whether its title or url contains a substring I wrote by hand, and the substrings are entity names. "Cristiano Ronaldo" is exactly what appears in the title of a page about Cristiano Ronaldo. So the metric rewards string overlap by construction, and 88% of everything it marks relevant contains a literal query term.
>
> Scored against MS MARCO's own human judgments instead, that same keyword counter trails a real cross-encoder by 0.147. Here it trails by 0.037. This evaluation was compressing the difference between a good reranker and a bad one, which is the one job a reranking evaluation has.
>
> Everything below still holds as *relative* measurement. The defects it found were real, the reranker ablation was real, and the fixes measured against it moved production from 0.7394 to 0.8884. But the absolute numbers are worth less than I thought when I wrote them, and quoting one without the keyword baseline next to it would be misleading. I would rather leave that here than quietly edit the figures. The whole story is in [I wrote a transformer by hand](/posts/i-wrote-a-transformer-by-hand).

`;

const write = process.argv.includes("--write");

const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const { rows } = await pool.query(
    "SELECT id, content FROM posts WHERE slug = $1",
    [SLUG],
  );
  if (!rows.length) throw new Error(`no post with slug ${SLUG}`);
  const current = rows[0].content;

  if (current.includes(MARKER)) {
    console.log("  note already present, nothing to do");
    await pool.end();
    return;
  }

  // After the horizontal rule that closes the TL;DR, so the summary stays the
  // first thing read and the correction is the second.
  const rule = current.indexOf("\n---\n");
  if (rule === -1) throw new Error("could not find the rule after the TL;DR");
  const at = rule + "\n---\n".length;
  const next = `${current.slice(0, at)}\n${NOTE}${current.slice(at).replace(/^\n+/, "")}`;

  console.log(`  ${current.length} chars -> ${next.length} chars (+${next.length - current.length})`);
  if (!write) {
    console.log("  dry run, pass --write to apply");
    await pool.end();
    return;
  }

  await pool.query(
    "UPDATE posts SET content = $1, date_updated = NOW() WHERE slug = $2",
    [next, SLUG],
  );
  console.log("  written");
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
