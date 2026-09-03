# Presentation agent — architecture source of truth

Read this BEFORE touching `PresentationDiagram.tsx`. Every fact below is from the
real codebase at `C:\Users\admin\Desktop\workspace\presentation-agent` (a Bun +
Next.js monorepo: `apps/web`, `packages/engine`). Cited by file. If a design
question comes up, argue design — the facts are settled here.

Blog slug: `agentic-presentation-system`.

## The one-line shape

**You talk to ONE agent — the Orchestrator. It runs the deck in two stages
(outline, then slides) and delegates the long or specialist jobs. A deterministic
engine, not any model, draws and checks every slide.**

## The flow (this is what the diagram must express)

```
You ──brief+files──▶ Orchestrator ("deck")
                        │
   STAGE 1 · OUTLINE    │  write_the_outline
                        ├──▶ Outline agent ──▶ the argument (an approvable outline)
                        │        ▲  during the outline stage the orchestrator consults:
                        ├──▶ Data analyst   (ask_specialist "da")  → findings (figures)
                        └──▶ SEO specialist (ask_specialist "seo") → advice (shown on the approval screen)
                        │
              ── YOU APPROVE THE OUTLINE ──  (human gate; freezes the shape by card id)
                        │
   STAGE 2 · SLIDES     │  build_the_slides
                        └──▶ Slide agent ──▶ builds/edits slides; per card runs a design pass:
                                 design_deck, once per card:
                                   Slide idea (invent)   → what the slide looks like (NO catalogue)
                                   Shape matcher (match) → is there a block that can draw it
                                 then per card:
                                   Layout composer  → card → layout tree           (auto layout)
                                   Hole filler      → fills holes in a hand-drawn/template layout
                        │
                        ▼
   DETERMINISTIC ENGINE (packages/engine, NO model):
        Layout engine (layout-engine.ts) draws every pixel from the layout tree
        Linter (lint.ts) — the deterministic checker that refuses a layout that does not build
                        │
                        ▼
   RENDER — one layout function → three outputs:
        HTML editor (interactive, drag-to-edit)
        Static SVG (resvg)  → thumbnails, image export
        PowerPoint (.pptx via pptxgenjs)
                        │
                        ▼
   ── editable deck back to You (HTML + .pptx) ──
```

Key relationships to draw:
- The spine is **You → Orchestrator → Outline → (approve) → Slide → engine → render → deck.**
- **DA and SEO are consulted DURING the outline stage**, not as peers in a flat grid.
- **Slide idea / Shape matcher / Layout composer / Hole filler run DURING the slide stage**, per card, under the Slide agent.
- Every agent's `calledBy` in the code is the Orchestrator (`deck`) — but the *stage* and *calledVia* say WHEN, which is the real structure.

## The nine agents (from `apps/web/lib/agent/config.ts` — `DEFAULT_AGENTS`)

| key | name | role | model | called via | stage / when | tools |
|---|---|---|---|---|---|---|
| `deck` | **Orchestrator** | main | house (`MODEL_ID`) | you: chat / "Generate slides" | every message + build start | `ORCHESTRATOR_TOOLS` (cannot write a slide or rewrite the outline; can edit one attached card, set the contract, consult a specialist, have data read) |
| `outline` | **Outline agent** | main | house | `write_the_outline` | outline stage | `STAGE_TOOLS.outline` |
| `slide` | **Slide agent** | main | `SLIDE_MODEL` | `build_the_slides` | slide stage | `STAGE_TOOLS.deck` |
| `seo` | **SEO specialist** | specialist | house | `ask_specialist` | outline stage only, while argument is open | none (advises; cannot write the deck) |
| `da` | **Data analyst** | specialist | house | `ask_specialist` (agent "da") | usually before the argument is settled | none as *deck* tools; runs **Python in an E2B sandbox** — the ONLY agent allowed near the raw files; returns FINDINGS, never a table |
| `invent` | **Slide idea** | specialist | house | `design_deck` | once per card, in the slide stage | none; decides what a slide looks like WITHOUT the block catalogue (measured: 1-in-10 draws a picture with the catalogue, 7-in-10 without) |
| `match` | **Shape matcher** | specialist | `MATCH_MODEL` \|\| house | `design_deck` | right after `invent`, once per card | none; picks a block id from the library (≤5 or empty) |
| `composer` | **Layout composer** | specialist | `COMPOSER_MODEL` \|\| `SLIDE_MODEL` | a slide build | once per slide, in order | none; ONE card → ONE layout tree, refused by a deterministic checker if it does not build |
| `filler` | **Hole filler** | specialist | `SLIDE_MODEL` | a hand-drawn card | instead of the composer, for a template/hand-drawn layout | none; fills holes only, never changes the arrangement |

`MAIN_AGENT = "deck"` (the orchestrator). All specialists are consulted by it.

## Models & gateway (from `apps/web/lib/agent/limits.ts`, `app/agents/ModelLogo.tsx`)

- Everything routes through an **AI gateway** (`AI_GATEWAY_API_KEY`). Model ids are `provider/model`.
- **House default: `MODEL_ID = "deepseek/deepseek-v4-pro-0813"`** (DeepSeek). NOT Claude.
- **Slide model: `SLIDE_MODEL = "deepseek/deepseek-v4-pro-0813"`** too, currently (was Anthropic `claude-sonnet-5`; the two are split by env so the slides can be put back on Sonnet).
- **Model-portable.** The code's measurements name models it has run on: `anthropic/claude-sonnet-5`, `openai/gpt-5.6-luna`, `xai/grok-4.5`, Gemini `flash-lite`, plus DeepSeek. Providers with monogram chips in `ModelLogo.tsx`: xai (x), anthropic (A), openai (O), google (G), meta (M), mistral (M), **deepseek (D, `#4d6bfe`)**, groq (q). The repo deliberately uses a lettered provider monogram, NOT a brand logo ("a wrong logo is a claim about somebody else's brand"). If a model chip is shown in the diagram it MUST be labelled (the letter alone is not legible to a reader).

## Stores / resources (from `apps/web/lib/agent/wiring.ts` + the user's naming)

The agent-reachable resources (`ResourceKey`), with read/write/add:
- `deck` — the deck's own settled values / arrangement
- `outline` — the argument
- `contract` — how much every slide owes (the spec)
- `intake` — the checklist: what the deck needs and where each fact came from
- `data` — the client's spreadsheet/files (only the Data analyst truly reads them)
- `slides` — the built slides
- `blocks` — **the component store / block catalogue** (the library of prebuilt blocks; the layouts the composer picks from)
- `skills` — static guidance loaded by name
- `web` — the open web, read through **Tavily / DataForSEO** (billed per call; `research_web`, `keyword_demand`, `serp_positions`). A web figure can never be *bound*, only typed.

Plus the three the user named explicitly (deck-level stores, in `apps/web/lib/template`, `lib/brand.ts`, `apps/web/app/api/{templates,brands}`):
- **Component store** = the block catalogue (`packages/engine/blocks.ts`, `archetypes.ts`).
- **Template storage** = templates a deck can replay (`api/templates/[id]` + assets/intake/preview/relayout).
- **Brand storage** = brand kit: colours, fonts (`lib/brand.ts`, `api/brands/[id]/preview`).

## Deterministic engine (from `packages/engine/src`)

Files: `layout-engine.ts` (draws), `lint.ts` (the checker), `blocks.ts` + `archetypes.ts` (the component store / block vocabulary), `chart.ts`, `frames.ts`, `chrome.ts`, `deck.ts`, `kit.ts`. Glyphs measured with **fontkit**. No model runs here — it's a pure function; the checker refuses a layout that does not build.

## Render (from `apps/web/lib/{render,pptx}.ts`, deps)

One layout function feeds three outputs:
- **HTML editor** — interactive, drag-to-edit.
- **Static SVG** — via **resvg** — thumbnails, image export.
- **PowerPoint** — **pptxgenjs** — `.pptx`.

## State & persistence (from `apps/web/package.json`, grep)

- **Postgres** (`pg`) — deck / outline / run state.
- **PGlite** — in-browser preview DB, kept in step with Postgres via **Electric** (`@electric`).
- **Cloudflare R2** — rendered images, fonts, assets.

## Services (external)

- **E2B** — the Data analyst's Python sandbox (pandas, polars, openpyxl, python-docx, pdfplumber).
- **Tavily / DataForSEO** — the `web` resource (search, keyword demand, SERP positions).

## Things I got WRONG before (do not repeat)

- Claimed the agents were Outline / Data analyst / Strategist only (3). There are **nine**, orchestrated by `deck`.
- Put **Claude** on every agent. The house model is **DeepSeek** via a gateway (portable).
- Showed a bare "D" chip with no label — unreadable. Label the model or state it once.
- Drew the agents as a flat grid. The real structure is a **staged flow** (outline stage with DA/SEO consults; slide stage with the invent→match→composer/filler design pass).
