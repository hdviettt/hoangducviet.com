# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 14 personal blog with a custom CMS admin panel. TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Tiptap editor for the admin. Material 3 visual system (SEONGON Prosperous Blue accent, Google Sans Flex, layered surfaces, rounded shapes) across both the public site and the admin. Light mode default, dark mode supported. Deployed on Railway via Nixpacks with Bun runtime.

## Development Commands

```bash
bun run dev          # Start dev server
bun run build        # Production build
bun run start        # Start production server
bun run lint         # Lint with Biome
bun run format       # Format with Biome (auto-fix)
bunx tsc --noEmit    # Type check
```

> Use `bun`, not `npm` — it's the workspace convention (and a hook enforces it).

The dev server reads `DATABASE_URL` from env. To run dev against the production DB, prefix with `railway run --service database` (Railway CLI must be authenticated). The Postgres service is named `database` in the Railway project.

Database migrations are **hand-written SQL** in `drizzle/`, applied with the Railway CLI against the `database` service. The drizzle-kit snapshot is stale — avoid `drizzle-kit generate` (it also prompts interactively).

## Public Routing (App Router)

- `/` — **Homepage.** `ProfileHero` (photo + name + bio + socials + email) followed by the year-grouped writing feed. Series with 2+ published posts collapse to a `SeriesBlock` (parts visible inline); standalone posts render as flat rows.
- `/posts` — **Writing archive.** The full feed (posts + collapsed series) via `PostsList`. Canonical `/posts`.
- `/posts/[postSlug]` — **Individual post — the canonical URL for every post.** Series membership no longer creates a nested URL; the series page just links here. No redirect.
- `/series/[seriesSlug]` — Series landing page: hero, summary, and a numbered parts list that links to each part at `/posts/[slug]`.
- `/about` — About page. Reuses `ProfileHero`, then an expanded bio section.
- `/admin/*` — CMS admin (auth required). Edits posts, series, categories, media, internal-links, settings. Admin URL paths still say `/admin/projects` for backward compat with the form action URLs; the underlying tables are `series`.

**Gone / redirected:**
- `/series/[seriesSlug]/[postSlug]` — the old nested series-post URL was removed; posts canonicalize at `/posts/[slug]`.
- `/projects/*` — replaced by `/series/*` (308 redirects live in `next.config.mjs`).

The `/admin` panel has full CRUD for series/categories/etc. so the underlying data model can grow as needed.

## Other routes

- `/api/health` — Railway healthcheck
- `/api/auth/{login,logout,me}` — admin session
- `/api/{posts,projects,project-groups,categories,media,settings,analytics}` — admin CRUD APIs
- `/api/posts/[slug]`, `/api/projects/[slug]`, `/api/categories/[slug]`, `/api/media/[id]` — admin item-level APIs
- `/uploads/[...path]` — serves uploaded media from the persistent volume
- `/feed.xml` — RSS feed (latest 50 posts)
- `/llms.txt` — markdown index for LLMs (links to `/posts/[slug].md` and `/series/[slug].md`)
- `/posts/[postSlug]/md`, `/series/[seriesSlug]/md` — markdown export of an individual post or series
- `/sitemap.xml`, `/robots.txt` — SEO

## Database (Drizzle + Postgres)

- `src/db/schema.ts` — table definitions: `posts`, `post_categories`, `posts_categories`, `series`, `series_groups`, `series_posts`, `media`, `global`, `profile`, `admin_user`
- `src/db/index.ts` — Drizzle client with `pg` Pool
- `drizzle.config.ts` — Drizzle Kit config
- `drizzle/` — generated migration SQL files
- `scripts/rename-projects-to-series.cjs` — one-shot data migration that
  renamed the `projects*` tables → `series*` and stripped the
  "<series>-N-" prefix from series-post slugs so URLs read cleanly.

A "series" is a topical container with N posts attached via `series_posts`. A series with 2+ linked posts surfaces on the homepage as a `SeriesBlock`. See `getFeedItems` and `getSeriesContext` in `src/lib/posts.ts`.

## Data Access (`src/lib/`)

- `posts.ts`
  - `getPosts({ limit?, withCategories? })` — list published posts
  - `getPostBySlug(slug)` — single post; throws when not found
  - `getAdjacentPosts(slug)` — chronological previous/next post (used as fallback when no series)
  - `getSeriesForPost(slug)` — series association if any
  - `getFeedItems({ limit? })` — **homepage feed**. Returns a `FeedItem[]` union of `{ kind: 'post' }` and `{ kind: 'series' }`. Multi-post series collapse into a single series item with parts ordered ASC by date.
  - `getSeriesContext(slug)` — for a post inside a series, returns part number, total, prev, next, and full parts list. Powers the series header and parts sidebar on post-detail pages.
- `series.ts` — `getSeriesList({ excludeWritingSeries? })`, `getSeriesBySlug(slug)`. Used by `/series/[s]/page.tsx`, `/series/[s]/md/route.ts`, and `/llms.txt`.
- `global.ts` — `getGlobalMetadata()` (site title + tagline)
- `profile.ts` — `getProfile()` (name, bio HTML, image)
- `auth.ts` — env-var auth: `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `SESSION_SECRET`
- `jsonld.ts` — JSON-LD schema builders for posts/projects/breadcrumbs
- `posthog.ts` — analytics client init
- `r2.ts` — Cloudflare R2 SDK client (used for media uploads)
- `utils.ts` — small shared helpers

## Components (`src/components/`)

```
layout/
  FileExplorer.tsx          — main shell: sticky nav, theme toggle, reading-progress bar
  ClientFileExplorer.tsx    — "use client" wrapper so server pages can compose it
  ThemeProvider.tsx         — light/dark theme context

posts/
  PostDetail.tsx             — shared server component used by both
                                /posts/[slug] and /series/[s]/[p]
  SeriesBlock.tsx            — homepage/feed series row: meta header + title + TL;DR + parts list
  SeriesHeader.tsx           — banner above an individual post that belongs to a series
  SeriesParts.tsx            — sidebar list of all parts when reading a series post
  PostNavigation.tsx         — prev/next nav at the bottom of a post (series-aware URLs)
  InlineTableOfContents.tsx  — TOC sidebar generated from heading anchors

content/
  MarkdownContent.tsx        — react-markdown renderer with remark-gfm + KaTeX, image figures, custom widgets
  RenderedVisual.tsx         — renders raw HTML in `language-render` code blocks

widgets/
  WidgetBlock.tsx, Counter.tsx, Video.tsx, registry.ts, index.ts
                             — pluggable widgets injected via `language-widget:<name>` code fences
  MediaCarousel.tsx          — full-bleed scroll-snap media strip (`widget:carousel`)

providers/
  PostHogProvider.tsx        — analytics

admin/
  AdminSidebar, AdminHeader, PostForm, PageForm, ProjectForm, RichEditor (Tiptap), Toast
  StatusPill, EmptyState, etc.
                             — CMS UI surfaces, scoped under `/admin/*`. Uses font-mono container scope.
```

## Auth

Simple env-var comparison — no crypto, no DB lookup for sessions:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — compared on login
- `SESSION_SECRET` — set as cookie value on success, checked by middleware
- `src/middleware.ts` — protects `/admin` routes (except login)

## Content Rendering

1. **Markdown (Posts)** — `MarkdownContent.tsx` with `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`. Heading anchors generated from text; `<img>` wrapped in `<figure>` with optional caption. Plain `<img>` with `loading="lazy"` is used (not `<Image>`) so author-uploaded images keep their natural aspect ratio.
2. **Tiptap (Admin editor)** — markdown I/O via `tiptap-markdown`. Supports slash commands, image paste/drop, toolbar.
3. **Widget fences** — a ```` ```widget:<name> ```` code fence carries a JSON body that becomes props. A bare JSON *array* is passed as `items`, so list-shaped widgets can be written without a wrapper object. Fences round-trip through the Tiptap editor byte-for-byte.
   - `widget:carousel` — full-bleed scroll-snap strip of images/clips, one caption per slide, styled after deepmind.google. Each slide is a real `<figure>` in the SSR HTML, so captions stay crawlable. Clips autoplay muted and loop with no player chrome, and only while a slide is both centred and on screen. Set `ratio` to match the source assets (default `16 / 9`) or they letterbox. When they do, `mat` decides what fills the canvas: `brand` (default, a quiet single-hue SEONGON sweep), `ambient` (a blurred copy of the slide's own picture — better under colourful art, near-invisible behind white diagrams), or `flat`. `/posts/<slug>.md` expands these fences into plain `![caption](src)` images for agent readers — see `src/lib/markdown-export.ts`.

## Media / Image Handling

- Uploads saved to the directory at `UPLOADS_PATH` (Railway: `/data/uploads` persistent volume).
- Served via `/uploads/[...path]` route that reads from disk.
- Optional Cloudflare R2 backend via `src/lib/r2.ts` — when configured, uploads go to R2 instead.
- Upload API at `/api/media` returns `{ url: "/uploads/<filename>" }` (or a public R2 URL).
- Editor paste/drop handler uploads to API, inserts the URL into the markdown content.

## Styling — Material 3

The whole product (public site **and** admin) is one Material 3 design system. Design
tokens live as HSL CSS variables in `src/app/globals.css` (`--md-sys-color-*`,
`--md-sys-shape-*`, `--md-sys-elevation-*`, `--md-sys-motion-*`) and are exposed as
Tailwind utilities in `tailwind.config.ts` (`bg-md-*`, `text-md-*`, `border-md-*`,
`rounded-{sm,md,lg,xl,2xl}`, `shadow-md-{1..5}`, `ease-md-*`).

- **Light mode default**, class-based dark mode (`html.dark`). Every `md-*` token has a dark value — use tokens, never hardcode hex / `bg-white` / `text-black`.
- **Primary = SEONGON Prosperous Blue `#004AEF`** (`hsl(221 100% 47%)`). Change `--md-sys-color-primary` to rebrand; the rest derives from the M3 roles (secondary, tertiary, error, `surface-container-{low..highest}`, outline, outline-variant).
- **Fonts:** `DM Sans` (closest open match to Google Sans) as the sans family — still exposed under the CSS-var name `--font-inter` for backward compat — weights 400/500/600/700; `JetBrains Mono` via `font-mono` for code and tabular numbers.
- **Type scale:** M3 utility classes `.md-display-*`, `.md-headline-*`, `.md-title-*`, `.md-body-*`, `.md-label-*` (defined in globals.css). Prefer these over raw `text-xl`/`text-sm`.
- **Shape:** M3 corner scale (4/8/12/16/28px), not sharp corners. Panels/cards → `rounded-xl`; pills/toggles/status chips → `rounded-full`.
- **Component utilities (globals.css):** `.md-btn` (+ `-filled`/`-tonal`/`-outlined`/`-text`, `-sm`/`-lg`/`-pill`); `.md-card` (+ `-elevated`/`-outlined`/`-filled`); `.md-field` / `.md-field-dense` / `.md-field-label` for inputs; `.md-elevation-*`.
- **Admin** uses the same system: shared `AdminPageHeader` (`components/admin/PageHeader.tsx`), M3 sidebar + top bar, `md-btn`/`md-field` forms, tonal status chips.
- `.article-content` — post typography (~17px body, Google body-gray, capped at 68ch reading width; figures, code blocks, and tables span the full column).
- `.deck-label` / `.deck-display` — legacy utilities kept as **M3-tuned aliases** (no more extrabold / negative tracking); don't extend them.
- `.prose-editor` — Tiptap editor content styling.

## Code Style

- Biome: 2-space indentation, double quotes, auto-organize imports.
- TypeScript strict mode, path alias `@/*` → `./src/*`.

## Scripts (`scripts/`)

Helper Node CommonJS scripts for content management. Run via `railway run --service database node scripts/<file>.cjs` so they get the production `DATABASE_PUBLIC_URL`.

- `list-posts.cjs` — list all posts (slug, status, length, date)
- `dump-post.cjs <slug>` — print a single post as JSON
- `audit-descriptions.cjs` — find posts/projects with empty descriptions
- `pull-series.cjs` — pull all series posts into `scripts/series/original/*.md`
- `push-series.cjs` — push edited markdown from `scripts/series/rewritten/*.md` back to DB (use `--commit` to write; default is dry-run)
- `push-tldrs.cjs` — push hardcoded TL;DR text for posts and project summaries
- `migrate-from-directus.ts` — one-shot import from a previous Directus instance

`scripts/series/` is gitignored. The `.cjs` helpers are committed; the dumped/rewritten markdown is not.

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (Railway provides via variable reference). Local dev can use `DATABASE_PUBLIC_URL` from the Railway DB service.
- `SESSION_SECRET` — cookie value for admin auth.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — admin login credentials.
- `UPLOADS_PATH` — media storage directory (`/data/uploads` on Railway).
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog analytics.
- `NEXT_PUBLIC_BASE_URL` — site URL for OpenGraph and SEO.
- `R2_*` — optional Cloudflare R2 credentials for media uploads.

## Deployment

- Railway, with Nixpacks + Bun runtime.
- PostgreSQL via Railway addon (service name: `database`).
- Persistent volume at `/data/uploads` for media (or R2 if configured).
- Health check at `/api/health`.
- Auto-deploys on push to `main`.
- Next.js 14 requires `experimental.serverComponentsExternalPackages: ["pg"]` in `next.config.mjs`.
- Data-access functions in `src/lib/` must wrap DB calls in try/catch so build-time prerendering doesn't fail when the DB is unreachable.
