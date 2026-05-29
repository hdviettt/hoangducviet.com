# Agent-readiness checks — status, location, fix recipes

Per-check detail for isitagentready.com findings on `hoangducviet.com`. Load when fixing a specific finding or adding an agent-facing surface.

## Contents

- [Scan field map](#scan-field-map)
- [Shipped checks](#shipped-checks)
  - [DNS-AID](#dns-aid)
  - [Markdown for Agents](#markdown-for-agents)
  - [Agent Skills index](#agent-skills-index)
  - [A2A agent card](#a2a-agent-card)
- [Skip-listed checks](#skip-listed-checks)
- [Recipe: add a new agent skill](#recipe-add-a-new-agent-skill)
- [Recipe: add a new content type](#recipe-add-a-new-content-type)
- [Recipe: add a new well-known endpoint](#recipe-add-a-new-well-known-endpoint)

## Scan field map

The scan returns nested `checks.*`. Known fields and what satisfies them:

| Scan field | Finding name | Satisfied by |
|---|---|---|
| `checks.discoverability.dnsAid.status` | DNS-AID | SVCB record + DNSSEC validating |
| `checks.contentAccessibility.markdownNegotiation.status` | Markdown for Agents | `Accept: text/markdown` → `text/markdown` |
| `checks.discoverability.agentSkills.status` (approx) | Agent Skills index | `/.well-known/agent-skills/index.json` 200 + digests match |

Field paths can change as the scanner evolves — read the actual JSON, do not hard-code paths.

## Shipped checks

### DNS-AID

- **Status:** done (app side). DNS records + DNSSEC are Cloudflare dashboard actions.
- **Premise:** agents discover an A2A endpoint over DNS. Honest here because the A2A agent is real.
- **Record:** `_a2a._agents.hoangducviet.com SVCB 1 hoangducviet.com. alpn="a2a" port="443" mandatory="alpn,port"`.
- **DNSSEC:** enable on the `.com` zone; Cloudflare is the registrar so the DS record is automatic — just confirm it shows "Active" and `AD=true` resolves. Until the DS propagates, the check fails even though the record exists.
- **Fix if it regresses:** confirm `/.well-known/agent-card.json` is live (the SVCB target must resolve to a real agent), then re-check the SVCB record and DNSSEC in Cloudflare.

### Markdown for Agents

- **Status:** done, app-level (no Cloudflare plan needed).
- **Where:** `src/middleware.ts` — `markdownTarget(pathname)` maps content paths to their markdown route; `wantsMarkdown()` checks the `Accept` header. Sets `Vary: Accept`.
- **Token header:** each markdown route sets `x-markdown-tokens` (`Math.ceil(body.length / 4)`).
- **Covered paths:** `/` → `/llms.txt`; `/posts/[slug]` → `/posts/[slug]/md`; `/series/[s]` → `/series/[s]/md`; `/series/[s]/[p]` → `/posts/[p]/md`.
- **Gotcha:** the `config.matcher` MUST use `:path*`, not `:slug` — single-segment matchers silently fail in the Railway build.
- **Fix if a new page type returns html to agents:** add a `markdownTarget()` branch + matcher entry; see the content-type recipe below.

### Agent Skills index

- **Status:** done.
- **Where:** index at `src/app/api/agent-skills/route.ts`; per-skill at `src/app/api/agent-skills/[name]/route.ts`; both rewritten from `/.well-known/agent-skills/...` in `next.config.mjs`. Data from `SKILLS` + `buildSkillMarkdown()` in `src/lib/agent.ts`.
- **Schema:** `https://schemas.agentskills.io/discovery/0.2.0/schema.json`. Each entry: `name`, `type: "skill-md"`, `description`, `url`, `digest` (`sha256:<hex>` of the served SKILL.md bytes).
- **Invariant:** the index computes the digest from `buildSkillMarkdown(s)`; the `[name]` route serves `buildSkillMarkdown(skill)`. Same function → bytes match. Never break this.
- **Fix / add:** edit the `SKILLS` array (see recipe). Never hand-edit the index or a SKILL.md.

### A2A agent card

- **Status:** done.
- **Where:** `buildAgentCard()` in `src/lib/agent.ts`; served at `/api/agent-card`, rewritten from `/.well-known/agent-card.json` (+ legacy `/.well-known/agent.json`).
- **Skills:** derived from `SKILLS` (id = skill name). Identity fields come from the live profile/global tables with safe fallbacks (never throws at build time).
- **Endpoint:** `url` points at `/api/a2a`, which implements JSON-RPC `message/send` and routes text in `runAgentSkill()`.

## Skip-listed checks

Deliberately not implemented — premise is false for a content site. Re-evaluate only if the premise becomes true.

| Finding | RFC / spec | Implement only when |
|---|---|---|
| OAuth / OIDC discovery | RFC 8414 | real OAuth-protected APIs + an IdP exist |
| OAuth Protected Resource | RFC 9728 | a protected resource issues tokens |
| Auth.md agent registration | WorkOS auth.md | the two above exist |
| MCP Server Card | SEP-1649 (draft, unmerged) | an actual MCP server is deployed |
| WebMCP | webmachinelearning proposal | the site exposes real in-browser agent actions |
| API Catalog | RFC 9727 | real API endpoints + OpenAPI spec (marginal; optional) |

If asked to implement one of these to "go green," push back: explain it would publish metadata for capabilities the blog lacks, which is broken and not credible.

## Recipe: add a new agent skill

1. Add an entry to `SKILLS` in `src/lib/agent.ts`:
   - `name`: lowercase + hyphens (1–64 chars), e.g. `find-by-tag`.
   - `title`, `description`, `tags`, `examples`, `sampleMessage`, `usage`.
2. Add a routing branch in `runAgentSkill()` that handles the new intent against real data.
3. Typecheck, deploy, verify: the card lists the new skill, the index has a new entry, its SKILL.md digest matches.

Do not touch the index route, the `[name]` route, or any SKILL.md — they regenerate from `SKILLS`.

## Recipe: add a new content type

For a new public route like `/notes/[slug]` that agents should read as markdown:

1. Add a markdown route (e.g. `/notes/[slug]/md`) serving `text/markdown` + `x-markdown-tokens`.
2. In `src/middleware.ts`, add a `markdownTarget()` branch mapping `/notes/[slug]` → `/notes/[slug]/md`.
3. Add the path to `config.matcher` using `:path*` (e.g. `/notes/:path*`).
4. Typecheck, deploy, verify negotiation (`Accept: text/markdown` → `text/markdown`; plain → `text/html`).

## Recipe: add a new well-known endpoint

1. Create the handler under `src/app/api/<name>/route.ts` (NOT under a leading-dot folder).
2. Add a rewrite in `next.config.mjs`: `/.well-known/<path>` → `/api/<name>`.
3. Typecheck, deploy, curl the well-known URL to confirm 200 + correct content-type.
