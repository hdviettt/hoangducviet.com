---
name: agent-readiness
description: This skill should be used when the user asks to "audit agent readiness", "run isitagentready", "fix an agent readiness finding", "make the blog agent-discoverable", "update the agent-skills index", "kiểm tra agent readiness", "fix lỗi isitagentready", or when adding/changing any feature that affects how AI agents discover or read this blog (new agent skill, new content route, new .well-known endpoint). It documents how this Next.js blog implements agent readiness (per isitagentready.com), the deliberate skip-list, and the procedure to audit, fix, and keep it in sync. Use it before touching agent-facing surfaces so the implementation does not drift.
---

# agent-readiness

How `hoangducviet.com` (Next.js 14 App Router, Railway behind Cloudflare) implements "agent readiness" as scored by isitagentready.com — what is shipped, what is deliberately skipped, and how to keep it correct when the blog gains features. This is the knowledge an agent or a developer consults before changing any agent-facing surface.

## When this applies

- Auditing the site against isitagentready.com or fixing one of its findings.
- Adding a new agent capability (a new A2A skill the blog exposes to agents).
- Adding a new public content type or route (agents should be able to read it as markdown).
- Adding or changing any `/.well-known/*` endpoint.
- Any time someone asks "do I need to update the agent stuff?" after a feature change.

Do NOT use this skill for: general SEO, normal page/feature work that does not touch agent discovery, or implementing the skip-listed checks (see below) unless the blog has genuinely gained OAuth-protected APIs or an MCP server.

## Core principle: one source of truth

The agent's skills are defined ONCE in the `SKILLS` array in `src/lib/agent.ts`. That array drives three surfaces, so they cannot drift:

1. The A2A Agent Card (`/.well-known/agent-card.json`).
2. The Agent Skills Discovery index (`/.well-known/agent-skills/index.json`).
3. Each per-skill `SKILL.md` (`/.well-known/agent-skills/<name>/SKILL.md`).

`buildSkillMarkdown()` renders the SKILL.md; the index route hashes that exact output for each entry's `sha256` digest. To add or change an agent skill, edit `SKILLS` only — everything else follows. Never hand-edit the index or a SKILL.md.

## What is shipped (architecture)

| Surface | Public URL | Handler / source | Notes |
|---|---|---|---|
| A2A Agent Card | `/.well-known/agent-card.json` | `src/app/api/agent-card` (rewrite) | Built from `buildAgentCard()` in `src/lib/agent.ts`. |
| A2A JSON-RPC endpoint | `/api/a2a` | `src/app/api/a2a` | `message/send`, returns a completed Task; skills routed in `runAgentSkill()`. |
| Agent Skills index | `/.well-known/agent-skills/index.json` | `src/app/api/agent-skills` (rewrite) | v0.2.0 schema; `digest` = sha256 of served SKILL.md bytes. |
| Per-skill SKILL.md | `/.well-known/agent-skills/<name>/SKILL.md` | `src/app/api/agent-skills/[name]` (rewrite) | Byte-identical to what the index hashed. |
| Markdown for Agents | `/`, `/posts/[slug]`, `/series/[s]`, `/series/[s]/[p]` | `src/middleware.ts` | `Accept: text/markdown` → existing md route; sets `Vary: Accept` + `x-markdown-tokens`. |
| Markdown sources | `/llms.txt`, `/posts/[slug]/md`, `/series/[s]/md` | route handlers | Serve `text/markdown` + `x-markdown-tokens`. |
| DNS-AID | `_a2a._agents.hoangducviet.com` SVCB + DNSSEC | Cloudflare DNS (manual) | App side only needs the A2A card to be real. |

Two gotchas that cost real debugging time — both documented in `references/checks.md`:

- **Leading-dot folders don't route in App Router.** Never put a handler under `app/.well-known/...`. Serve it under `app/api/...` and add a rewrite in `next.config.mjs`.
- **The middleware matcher single-segment `:slug` silently fails in the Railway build.** Use `:path*`. (`/posts/:slug` ran on `/` but not on `/posts/x` until switched to `/posts/:path*`.)

## The honest skip-list (assessed, deliberately NOT implemented)

This blog is a content site, not an authenticated API or MCP product. Implementing the following would publish metadata for capabilities that do not exist — broken and dishonest. Do NOT implement unless the premise becomes true.

| Finding | Skip unless… |
|---|---|
| OAuth / OIDC discovery (RFC 8414) | the blog gains real OAuth-protected APIs with an IdP. |
| OAuth Protected Resource (RFC 9728) | there is a protected resource agents obtain tokens for. |
| Auth.md agent registration | the above exists (it builds on them). |
| MCP Server Card (SEP-1649) | you stand up an actual MCP server (different protocol from A2A). |
| WebMCP | the site has real in-browser agent actions (it has none today). |
| API Catalog (RFC 9727) | marginal — only if real API endpoints + an OpenAPI spec exist. Optional. |

Chasing a 100% scanner score is a vanity metric. Ship only what is real.

## Maintenance procedure

Run the matching path, then always finish with Audit + Verify.

- **New agent skill** → add an entry to `SKILLS` in `src/lib/agent.ts` (name = lowercase + hyphens) and add its routing branch in `runAgentSkill()`. Nothing else.
- **New public content type/route** (e.g. `/notes/[slug]`) → add a `markdownTarget()` mapping in `src/middleware.ts` to its markdown route, add the path to the `config.matcher` (use `:path*`), and ensure a `/md` (or equivalent) route exists serving `text/markdown` + `x-markdown-tokens`.
- **New `.well-known` endpoint** → handler under `app/api/...` + rewrite in `next.config.mjs`.
- **A new scanner finding appears** → check it against the skip-list first; if it is honest for a content site, read `references/checks.md` for the pattern, else record it as deliberately skipped.

Always finish:
1. `npx --package typescript tsc --noEmit` (must pass).
2. Commit; deploy is push-to-`main` (ask before pushing — see project CLAUDE.md).
3. Re-run the scan and the verify commands below.

## Verify commands

```bash
# Full scan
curl -s -X POST https://isitagentready.com/api/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://hoangducviet.com"}' | python -m json.tool

# Agent card + A2A endpoint
curl -s https://hoangducviet.com/.well-known/agent-card.json
curl -s -X POST https://hoangducviet.com/api/a2a -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"message/send","params":{"message":{"role":"user","kind":"message","messageId":"m1","parts":[{"kind":"text","text":"list series"}]}}}'

# Markdown negotiation (agent gets markdown, browser gets html)
curl -s -o /dev/null -w "%{content_type}\n" -H "Accept: text/markdown" https://hoangducviet.com/
curl -s -o /dev/null -w "%{content_type}\n" https://hoangducviet.com/

# Agent-skills index + digest match (must print MATCH for every skill)
B=https://hoangducviet.com; curl -s "$B/.well-known/agent-skills/index.json" \
 | python3 -c 'import sys,json;[print(s["name"],s["url"],s["digest"]) for s in json.load(sys.stdin)["skills"]]' \
 | tr -d '\r' | while read n u d; do a="sha256:$(curl -s "$B$u" | sha256sum | cut -d" " -f1)"; \
   [ "$a" = "$d" ] && echo "$n MATCH" || echo "$n MISMATCH"; done
```

When verifying digests by hand, hash the raw stream (`curl ... | sha256sum`) — `$(...)` strips the trailing newline and gives a false mismatch. Python's `urllib` is blocked by Cloudflare (403); use `curl`.

## Anti-patterns

- Do NOT hand-edit `/.well-known/agent-skills/index.json` or any `SKILL.md` — edit the `SKILLS` array; both are generated.
- Do NOT put route handlers under `app/.well-known/...` (leading-dot folders don't route) — use `app/api/...` + a rewrite.
- Do NOT use a single-segment matcher (`:slug`) in `src/middleware.ts` — it silently fails in prod; use `:path*`.
- Do NOT implement skip-listed checks (OAuth/OIDC, Protected Resource, Auth.md, MCP Server Card, WebMCP) to chase a green score — they would advertise capabilities the blog does not have.
- Do NOT compute a digest over a different string than the bytes actually served — both must come from `buildSkillMarkdown()`.

## Skill files

| File | Purpose | When to load |
|---|---|---|
| `references/checks.md` | Per-check status, RFC, where implemented, exact fix/add recipe, scan field map | When fixing a specific finding or adding a surface |
