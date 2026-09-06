// Viet lai phan tieu su o /about (profile.about_html).
//
// Ban truoc hong o ba cho:
//   - Doan 1 lap lai gan nguyen van cau hero ngay phia tren no, va cau
//     "I am an undergraduate at Foreign Trade University in Hanoi" thi lap lai
//     muc Education ngay ben duoi. Mot trang ba lan noi mot y.
//   - Giong van muot va chung chung, khong phai giong Viet viet trong bai
//     ("Why our AI team failed"): ngan, truc tiep, ke duoc mot canh cu the,
//     dam noi cai minh lam sai.
//   - Khong co mot chi tiet nao ma CV khong co. Neu /about chi ke lai CV thi
//     no khong ton tai cung duoc.
//
// Ban nay lay canh cu the tu chinh bai cua Viet (cau hoi cua chu tich ve chi
// phi), va noi mot y ma CV khong noi duoc: vi sao anh ay xay it model di.
//
//   node scripts/set-about-copy.cjs --dry
//   railway run --service database node scripts/set-about-copy.cjs

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

const dry = process.argv.includes("--dry");

const ABOUT_HTML = `<p>I was the AI Leader at SEONGON, a 120-person search marketing agency in Hanoi. I built the runtime our agents run on, wrote a fair share of the agents themselves, and led a team of five. By the end, most of the company was using something we had built.</p>
<p>The most useful thing I learned came out of a question I could not answer. After a year of AI work, our chairman asked whether costs had gone down. They had gone up, and we had hired more people. Everything I have built since starts there. A tool nobody reorganizes their work around is a demo, and a company that accumulates prompts is renting, while a company that accumulates procedures compounds.</p>
<p>So most of what I build ends up with less model in it than it started with. Of the 103 parts in the platform repo, 52 never call a model at all. I like work where the mechanism is visible, which is also why I <a href="/work/mini-search-engine">built a search engine from scratch</a>: crawler, inverted index, BM25, PageRank, a neural reranker, the whole machine my industry spends its days optimizing against.</p>
<p>I did all of this alongside a business degree rather than a computer science one. That is probably why I care less about the model than about where it lands in someone's actual work, what happens when it is wrong, and whether anyone trusts it enough to use it twice.</p>`;

async function main() {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
    ssl: process.env.DATABASE_PUBLIC_URL
      ? { rejectUnauthorized: false }
      : false,
  });

  const before = await pool.query(
    "select id, about_html from profile order by id limit 1",
  );
  const row = before.rows[0];
  if (!row) throw new Error("khong tim thay profile");
  console.log(
    `profile.about_html: ${(row.about_html || "").length} -> ${ABOUT_HTML.length}`,
  );

  if (dry) {
    console.log(ABOUT_HTML.replace(/<\/p>/g, "</p>\n"));
    console.log("--- --dry: khong ghi gi ---");
    await pool.end();
    return;
  }

  const file = path.join(__dirname, `_about-backup-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify(row, null, 2));
  console.log(`sao luu -> ${path.basename(file)}`);

  await pool.query("update profile set about_html = $2 where id = $1", [
    row.id,
    ABOUT_HTML,
  ]);
  console.log("ghi: ok");
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
