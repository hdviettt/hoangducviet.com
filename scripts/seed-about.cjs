// Ghi than trang About vao profile.about_html, dang MARKDOWN.
//
// Sau khi o Body trong /admin -> Settings chuyen sang markdown, than trang
// About di qua dung ong render cua bai viet. Nghia la moi thu dung duoc trong
// bai viet cung dung duoc o day: tieu de, danh sach, bang, khoi ```render```,
// va widget.
//
// Script nay chi de DUNG LAI noi dung sau khi doi dinh dang. Sau do sua thang
// tren CMS; dung chay lai script tru khi muon quay ve ban goc.
//
//   railway run --service database node scripts/seed-about.cjs
//   railway run --service database node scripts/seed-about.cjs --dry

const { Client } = require("pg");

const BODY = `I joined an SEO agency as an operations intern. Two years later I left behind the AI platform it now runs on: 120 people across 30 teams, twenty-odd agents, LLM workflows and machine-learning systems in production. I founded the AI team that built it and led five people.

**I am twenty. I have not finished my degree.**

Model quality was never the constraint. What broke things sat around the model: who answers for an agent that publishes something wrong, how anyone finds out it went wrong, and what counts as correct in a domain the model has never worked in. That last question is domain knowledge. A better model does not answer it.

\`\`\`widget:career
{}
\`\`\`

## Three things I would say again

**The platform came before the tools.** Single sign-on, a data warehouse reading the whole company, one shared theme. That layer went in first. The twenty-odd solutions on top were cheap to build because it already existed. 120 people, 30 teams, 20+ solutions in production. [See the platform](/work/agentic-ai-platform)

**The model was the easy part.** Most of what I shipped was standards and plumbing: nonhuman identity, observability, evals, human-in-the-loop, cost tracking. That is where the work went. 80% of the company trained, 50+ measurable outcomes. [Why our AI team failed](/posts/why-our-ai-team-failed)

**Domain knowledge decides what correct means.** So I built a search engine from scratch. Crawler, inverted index, BM25, PageRank, a BERT reranker. Then I wrote up every part. You cannot point AI at search without knowing how ranking works. [Building a mini search engine](/collection/building-a-mini-search-engine)

## What I am looking for

I have done the agent-building job. What I want next is a domain with enough mechanism in it to take apart, where AI is the spearhead and the business outcome is the point.

- **Mechanism over novelty.** Enough moving parts that understanding them is an advantage. Wrapping an API in a chat box teaches you nothing.
- **AI as the spearhead.** The deliverable is a business result. AI is how it gets there before the incumbent can move.
- **It has to compound.** Work that stacks on the SEO and marketing domain I already know. Starting from zero throws away the only edge I have.
- **It has to move.** Short feedback loops. I have no patience for a five-year payoff that teaches you nothing in the meantime.
`;

const dry = process.argv.includes("--dry");

(async () => {
  const c = new Client({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL
      ? { rejectUnauthorized: false }
      : false,
  });
  await c.connect();
  const { rows } = await c.query("select about_html from profile where id = 1");
  const before = (rows[0]?.about_html || "").length;
  console.log(`truoc: ${before} ky tu`);
  console.log(`sau  : ${BODY.length} ky tu`);
  if (dry) {
    console.log("\n(dry, chua ghi)");
  } else {
    await c.query("update profile set about_html = $1 where id = 1", [BODY]);
    console.log("\nda ghi");
  }
  await c.end();
})();
