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

const BODY = `I joined an SEO agency as an operations intern. Two years later I left, and the company still runs on the AI platform I built while I was there: 120 people across 30 teams, more than twenty agents, LLM workflows and machine-learning systems in production. I started the AI team behind it and led five people.

**I am twenty, and I am still an undergraduate.**

Model quality was never the constraint. The hard problems were all around the model: who is responsible when an agent publishes something wrong, how anyone finds out that it did, and what counts as correct in a field the model has never worked in. Answering that last one takes domain knowledge, and a better model will not supply it.

\`\`\`widget:career
{}
\`\`\`

## What actually mattered

**Build the platform before the tools.** Single sign-on, a data warehouse covering the whole company, one shared theme. That foundation went in first, which is the only reason the twenty-odd solutions on top were cheap to build. 120 people, 30 teams, more than 20 solutions in production. [See the platform](/work/agentic-ai-platform)

**The model was the easy part.** Most of what I shipped was standards and plumbing: nonhuman identity, observability, evals, human-in-the-loop, cost tracking. That is where the time went. 80% of the company trained, more than 50 measurable outcomes. [Why our AI team failed](/posts/why-our-ai-team-failed)

**You need the domain to judge the output.** So I built a search engine from scratch: crawler, inverted index, BM25, PageRank, a BERT reranker. Then I wrote up how each piece works. You cannot direct AI at search without understanding how ranking happens. [Building a mini search engine](/collection/building-a-mini-search-engine)

## What I am looking for

I have already built agents for a living. What I want next is an industry with enough machinery to be worth taking apart, where AI is the edge and the business result is the goal.

- **Depth over novelty.** Enough moving parts that understanding them is an advantage. Wrapping an API in a chat window teaches you nothing.
- **AI as the edge.** What I deliver is a business result. AI is how it arrives before the incumbent can react.
- **It has to compound.** Work that builds on the SEO and marketing knowledge I already have. Starting from zero would waste my only advantage.
- **It has to move fast.** Short feedback loops. I have no patience for a five-year payoff that teaches me nothing along the way.
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
