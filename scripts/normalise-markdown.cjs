// Normalise stored markdown so that opening a post in the editor is a no-op.
//
// The editor parses markdown and serialises it back on every keystroke. Where
// the stored form and the serialised form differ, the first edit to a post
// silently rewrites parts of it that were never touched. `roundtrip-check.cjs`
// lists those posts; this makes the stored form the one the editor produces,
// but only through transformations that were each checked to preserve or
// improve rendering. It never simply writes the editor's output back, because
// that output escapes a heading glued to an image (`\###`), which would turn a
// working heading into literal text.
//
//   railway run --service database node scripts/normalise-markdown.cjs
//   ... --write   to apply
//
// Transformations, all skipped inside fenced code blocks:
//
//   trailing whitespace   removed. A single trailing space is invisible; two
//                         would be a hard line break, and none of these are.
//   $$x$$ on one line     split onto three lines. remark-math parses the
//                         one-line form as inlineMath and the split form as a
//                         display block: same LaTeX, different size and
//                         placement. Verified with remark-math directly. Every
//                         one of these sits alone in its own paragraph after a
//                         line like "The formula looks like this:", so display
//                         is what was meant; the live page currently renders
//                         44 inline spans and zero display blocks.
//   image + heading       `![](url)### Title` split onto separate lines. It
//                         renders correctly today, but the editor rewrites it
//                         as `\###`, which does not.
//   image after prose     a blank line inserted before an image that sits on
//                         its own line directly under a paragraph, so it is a
//                         block rather than the tail of that paragraph. The
//                         alt text on these reads as a caption, and only a
//                         standalone image becomes a <figure>.
//   double spaces         runs of two or more spaces inside prose collapsed to
//                         one. Skipped inside inline code, where spacing can
//                         be deliberate; trailing runs are already gone, so
//                         none of these were hard line breaks.
//   final newline         added when the file ends on a table row, which is
//                         the one block the serialiser closes with a newline.
const { Pool } = require("pg");

const WRITE = process.argv.includes("--write");
const url = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_PUBLIC_URL / DATABASE_URL in env.");
  process.exit(1);
}
const pool = new Pool({
  connectionString: url,
  ssl: url.includes("localhost") ? undefined : { rejectUnauthorized: false },
});

const ONE_LINE_MATH = /^\$\$(.+)\$\$$/;
const IMAGE_THEN_HEADING = /^(!\[[^\]]*\]\([^)]*\))(#{1,6}\s.*)$/;
const STANDALONE_IMAGE = /^!\[[^\]]*\]\([^)]*\)$/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;

// Collapse runs of spaces, but never inside an inline code span: `a  b` may
// mean the two spaces.
function collapseSpaces(line) {
  return line
    .split("`")
    .map((part, i) =>
      i % 2 === 1 ? part : part.replace(/(\S) {2,}(\S)/g, "$1 $2"),
    )
    .join("`");
}

function normalise(content) {
  const lines = content.split("\n");
  const out = [];
  let inFence = false;
  const counts = {
    trailing: 0,
    math: 0,
    glued: 0,
    spaces: 0,
    imageBlock: 0,
    finalNewline: 0,
  };

  for (const raw of lines) {
    if (raw.startsWith("```")) {
      inFence = !inFence;
      out.push(raw);
      continue;
    }
    if (inFence) {
      out.push(raw);
      continue;
    }

    let line = raw;

    const trimmed = line.replace(/[ \t]+$/, "");
    if (trimmed !== line) counts.trailing++;
    line = trimmed;

    const glued = IMAGE_THEN_HEADING.exec(line);
    if (glued) {
      counts.glued++;
      out.push(glued[1], "", glued[2]);
      continue;
    }

    const math = ONE_LINE_MATH.exec(line);
    if (math && !math[1].includes("$$")) {
      counts.math++;
      out.push("$$", math[1], "$$");
      continue;
    }

    const collapsed = collapseSpaces(line);
    if (collapsed !== line) counts.spaces++;
    line = collapsed;

    // An image sitting directly under a paragraph is the tail of that
    // paragraph, so it never becomes a <figure> and its alt text never
    // becomes a caption.
    const prev = out.length ? out[out.length - 1] : "";
    if (STANDALONE_IMAGE.test(line) && prev.trim() && !prev.startsWith("```")) {
      counts.imageBlock++;
      out.push("", line);
      continue;
    }

    out.push(line);
  }

  // The table serialiser closes with a newline, so a file ending on a table
  // row without one differs from its own round trip by exactly that byte.
  while (out.length && out[out.length - 1] === "") out.pop();
  if (out.length && TABLE_ROW.test(out[out.length - 1])) {
    counts.finalNewline++;
    out.push("");
  }

  return { text: out.join("\n"), counts };
}

(async () => {
  const { rows } = await pool.query(
    "SELECT slug, content FROM posts ORDER BY slug",
  );
  let touched = 0;
  const totals = {
    trailing: 0,
    math: 0,
    glued: 0,
    spaces: 0,
    imageBlock: 0,
    finalNewline: 0,
  };

  for (const row of rows) {
    const content = row.content ?? "";
    if (!content) continue;
    const { text, counts } = normalise(content);
    if (text === content) continue;

    touched++;
    for (const k of Object.keys(totals)) totals[k] += counts[k];
    const parts = Object.entries(counts)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k} ${v}`)
      .join(", ");
    console.log(
      `${WRITE ? "write" : "would"}  ${row.slug.padEnd(58)} ${content.length} -> ${text.length}  (${parts})`,
    );

    if (WRITE) {
      const res = await pool.query(
        "UPDATE posts SET content = $1 WHERE slug = $2",
        [text, row.slug],
      );
      if (res.rowCount !== 1) console.log("   FAILED");
    }
  }

  const summary = Object.entries(totals)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  console.log(
    `\n${touched} post${touched === 1 ? "" : "s"} changed${summary ? `: ${summary}` : ""}.`,
  );
  if (!WRITE && touched) console.log("Re-run with --write to apply.");
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
