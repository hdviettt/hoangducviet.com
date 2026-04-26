# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 14 personal blog with a custom CMS admin panel. TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, Tiptap editor for the admin. Deck-style visual identity (bold sans-serif, electric indigo accent, sparse spacing) inspired by SEONGON's deck language. Light mode default, dark mode supported. Deployed on Railway via Nixpacks with Bun runtime.

## Development Commands

```bash
npm run dev          # Start dev server (Bun-powered)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint with Biome
npm run format       # Format with Biome (auto-fix)
npx --package typescript tsc --noEmit   # Type check
npx drizzle-kit generate                # Generate DB migrations
npx drizzle-kit migrate                 # Apply DB migrations
```

The dev server reads `DATABASE_URL` from env. To run dev against the production DB, prefix with `railway run --service database` (Railway CLI must be authenticated). The Postgres service is named `database` in the Railway project.

## Public Routing (App Router)

The frontend is a single-page experience with nested URLs for series posts:

- `/` — **The blog.** Hero (photo + name + bio + socials) followed by year-grouped writing list. Series with 2+ published posts collapse to a `SeriesBlock` (parts visible inline). Standalone posts render as flat rows.
- `/posts/[postSlug]` — Individual standalone post. If the slug belongs to a series, this route 308-redirects to `/series/[seriesSlug]/[postSlug]`.
- `/series/[seriesSlug]` — Series landing page. Title, TL;DR, summary, parts list.
- `/series/[seriesSlug]/[postSlug]` — Series-post canonical URL. Verifies the post actually belongs to the seriesSlug or 404s.
- `/admin/*` — CMS admin (auth required). Edits posts, series, categories, media, settings. Admin URL paths still say `/admin/projects` for backward compat with the form action URLs; the underlying tables are `series`.

**Deleted on purpose** (will 404):
- `/posts` — merged into `/`
- `/projects/*` — replaced by `/series/*`

The `/admin` panel still has full CRUD for series/categories/etc. so the underlying data model can grow back if needed.

## Other routes

- `/api/health` — Railway healthcheck
- `/api/auth/{login,logout,me}` — admin session
- `/api/{posts,projects,project-groups,categories,media,settings,analytics}` — admin CRUD APIs
- `/api/posts/[slug]`, `/api/projects/[slug]`, `/api/categories/[slug]`, `/api/media/[id]` — admin item-level APIs
- `/uploads/[...path]` — serves uploaded media from the persistent volume
- `/feed.xml` — RSS feed (latest 50 posts)
- `/llms.txt` — markdown index for LLMs (links to `/posts/[slug].md` and `/projects/[slug].md`)
- `/posts/[postSlug]/md`, `/projects/[projectSlug]/md` — markdown export of an individual post or project
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
  WidgetBlock.tsx, Counter.tsx, registry.ts, index.ts
                             — pluggable widgets injected via `language-widget:<name>` code fences

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

## Media / Image Handling

- Uploads saved to the directory at `UPLOADS_PATH` (Railway: `/data/uploads` persistent volume).
- Served via `/uploads/[...path]` route that reads from disk.
- Optional Cloudflare R2 backend via `src/lib/r2.ts` — when configured, uploads go to R2 instead.
- Upload API at `/api/media` returns `{ url: "/uploads/<filename>" }` (or a public R2 URL).
- Editor paste/drop handler uploads to API, inserts the URL into the markdown content.

## Styling

- Tailwind CSS with CSS variable theming (HSL format).
- **Light mode default**, class-based dark mode (`html.dark`).
- **Cool off-white** (`hsl(225 28% 98%)`) light bg / **deep cool** (`hsl(230 18% 7%)`) dark bg.
- **Electric indigo accent** (`hsl(234 100% 66%)` light / `hsl(234 100% 72%)` dark) — reserved for: series indicators (`SERIES · N PARTS` badge), link hovers, active-nav state, JSON-LD/TL;DR borders.
- Fonts: **Inter** (sans, body + heading) with weights 400–800; JetBrains Mono available via `font-mono` for tabular numbers and admin scope.
- Border radius globally 0 (sharp corners).
- `.article-content` — post typography. Body caps at 68ch reading width; figures, code blocks, and tables go full column width.
- `.deck-display` — display-bold heading style (extrabold, tight tracking, line-height 1).
- `.deck-label` — small caption-style label (used above page heroes and as section anchors).
- `.prose-editor` — Tiptap editor styling.

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
