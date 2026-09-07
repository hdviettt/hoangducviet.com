// Dua cau chuyen trang About vao CSDL, de sua duoc tu /admin -> Settings -> Body.
//
// Ban trong `lib/about.ts` van con va van la ban du phong: xoa sach o Body thi
// no quay lai. Nhung khi o Body co chu, chu do thang.
const { Client } = require("pg");

const HTML = [
  "<p>I joined an SEO agency as an operations intern. Two years later I left behind the AI platform it now runs on: 120 people across 30 teams, twenty-odd agents, LLM workflows and machine-learning systems in production. I founded the AI team that built it and led five people.</p>",
  "<p><strong>I am twenty. I have not finished my degree.</strong></p>",
  "<p>Model quality was never the constraint. What broke things sat around the model: who answers for an agent that publishes something wrong, how anyone finds out it went wrong, and what counts as correct in a domain the model has never worked in. That last question is domain knowledge. A better model does not answer it.</p>",
].join("");

(async () => {
  const c = new Client({
    connectionString: process.env.DATABASE_PUBLIC_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();
  await c.query("update profile set about_html = $1 where id = 1", [HTML]);
  const { rows } = await c.query("select about_html from profile");
  console.log(`da ghi ${rows[0].about_html.length} ky tu vao profile.about_html`);
  await c.end();
})();
