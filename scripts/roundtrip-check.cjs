// Byte-compare every post's stored markdown against what the editor gives back.
//
// The editor emits markdown on every keystroke and the form autosaves it, so a
// lossy round-trip does not damage one post: it silently rewrites whichever
// posts get opened. This drives a real browser over the real editor for every
// post in the database and reports any byte that changes.
//
// Run against a running server:
//   railway run --service hoangducviet.com node scripts/roundtrip-check.cjs
//
// Env:
//   BASE           default http://localhost:3000
//   ADMIN_USERNAME / ADMIN_PASSWORD   used to obtain a session
//   CHROME_PATH    default is the standard Windows install
//   ONLY           optional slug substring, to check a single post
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const BASE = process.env.BASE || "http://localhost:3000";
const CHROME =
  process.env.CHROME_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9351;
const OUT = path.join(os.tmpdir(), "cms-roundtrip");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let id = 0;
    const pending = new Map();
    ws.addEventListener("open", () =>
      resolve({
        send(method, params = {}) {
          const i = ++id;
          ws.send(JSON.stringify({ id: i, method, params }));
          return new Promise((res, rej) => pending.set(i, { res, rej }));
        },
        close: () => ws.close(),
      }),
    );
    ws.addEventListener("error", reject);
    ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      }
    });
  });
}

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i;
  }
  return a.length === b.length ? -1 : n;
}

(async () => {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) {
    console.error("ADMIN_USERNAME / ADMIN_PASSWORD not in env.");
    process.exit(1);
  }

  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass }),
  });
  if (!login.ok) {
    console.error("Login failed:", login.status);
    process.exit(1);
  }
  const jar = (login.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");

  const listRes = await fetch(`${BASE}/api/posts`, {
    headers: { Cookie: jar },
  });
  let posts = await listRes.json();
  if (!Array.isArray(posts)) posts = posts.posts ?? [];
  if (process.env.ONLY) {
    posts = posts.filter((p) => p.slug.includes(process.env.ONLY));
  }
  console.log(`Checking ${posts.length} posts against ${BASE}\n`);

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "rt-"));
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--window-size=1600,1200",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let targets = null;
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      targets = await r.json();
      if (targets.length) break;
    } catch {}
    await sleep(250);
  }
  if (!targets?.length) throw new Error("Chrome debugger never came up.");

  const page = targets.find((t) => t.type === "page");
  const cdp = await connect(page.webSocketDebuggerUrl);
  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  for (const pair of jar.split("; ")) {
    const eq = pair.indexOf("=");
    await cdp.send("Network.setCookie", {
      name: pair.slice(0, eq),
      value: pair.slice(eq + 1),
      domain: new URL(BASE).hostname,
      path: "/",
    });
  }

  let bad = 0;
  let checked = 0;
  fs.mkdirSync(OUT, { recursive: true });

  for (const post of posts) {
    const stored = post.content ?? "";
    await cdp.send("Page.navigate", {
      url: `${BASE}/admin/posts/${post.slug}/edit`,
    });

    // Wait for the editor to mount and expose the getter. An empty post
    // serialises to "", so readiness is the getter existing, not the string
    // being non-empty; testing for length reported empty drafts as timeouts.
    let got = null;
    for (let i = 0; i < 40; i++) {
      await sleep(400);
      const { result } = await cdp.send("Runtime.evaluate", {
        expression: `(() => {
          if (typeof window.__cmsMarkdown !== "function") return null;
          return JSON.stringify({ md: window.__cmsMarkdown() });
        })()`,
        returnByValue: true,
      });
      if (typeof result.value === "string") {
        const parsed = JSON.parse(result.value);
        if (parsed.md.length || stored.length === 0) {
          got = parsed.md;
          break;
        }
      }
    }

    checked++;
    if (got === null) {
      bad++;
      console.log(`  TIMEOUT  ${post.slug}`);
      continue;
    }
    if (got === stored) {
      console.log(
        `  ok       ${post.slug}  ${stored.length.toLocaleString()} chars`,
      );
      continue;
    }

    bad++;
    const at = firstDiff(stored, got);
    console.log(
      `  CHANGED  ${post.slug}  ${stored.length.toLocaleString()} -> ${got.length.toLocaleString()} chars, first diff at ${at}`,
    );
    console.log(
      `      stored: ${JSON.stringify(stored.slice(at - 40, at + 60))}`,
    );
    console.log(`      editor: ${JSON.stringify(got.slice(at - 40, at + 60))}`);
    fs.writeFileSync(path.join(OUT, `${post.slug}.stored.md`), stored, "utf8");
    fs.writeFileSync(path.join(OUT, `${post.slug}.editor.md`), got, "utf8");
  }

  cdp.close();
  chrome.kill();

  console.log(`\n${checked - bad}/${checked} round-trip byte-identical.`);
  if (bad) {
    console.log(`Differing pairs written to ${OUT}`);
    process.exit(1);
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
