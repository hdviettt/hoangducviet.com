# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 14 personal blog with a custom CMS admin panel. Uses TypeScript, Drizzle ORM, PostgreSQL, Tailwind CSS, and Tiptap editor. Terminal-themed dark design with JetBrains Mono and orange accent. Deployed on Railway via Nixpacks with Bun.

## Development Commands

```bash
npm run dev          # Start dev server (uses Bun)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint with Biome
npm run format       # Format with Biome (auto-fix)
npx --package typescript tsc --noEmit   # Type check
npx drizzle-kit generate               # Generate DB migrations
npx drizzle-kit migrate                # Apply DB migrations
```

## Architecture

### Routing (App Router)

- `/` — Homepage (profile + recent posts)
- `/posts` — Post list grouped by year
- `/posts/[postSlug]` — Post detail with TOC sidebar and prev/next
- `/projects` — Project list
- `/projects/[projectSlug]` — Project detail with related posts
- `/[pageSlug]` — Dynamic pages (block editor content)
- `/admin` — CMS admin panel (auth required)
- `/admin/posts/new` — Create post with WYSIWYG editor
- `/uploads/[...path]` — Serves uploaded media from persistent volume
- `/api/health` — Health check for Railway
- `/api/auth/*` — Login/logout/session
- `/api/posts|pages|projects|categories|media|settings` — CRUD APIs

### Database (Drizzle + PostgreSQL)

- `src/db/schema.ts` — All table definitions (posts, pages, projects, categories, media, global, profile, admin_user)
- `src/db/index.ts` — Drizzle client with pg Pool
- `drizzle.config.ts` — Drizzle Kit config
- `drizzle/` — Generated migration SQL files

### Data Access (`src/lib/`)

- `posts.ts` — getPosts, getPostBySlug, getAdjacentPosts (filters published)
- `pages.ts` — getPages, getPageBySlug
- `projects.ts` — getProjects, getProjectBySlug (includes related posts)
- `global.ts` — getGlobalMetadata (site title/tagline)
- `profile.ts` — getProfile (name, description, image)
- `auth.ts` — Simple env-var auth (ADMIN_USERNAME/ADMIN_PASSWORD/SESSION_SECRET)

### Components (`src/components/`)

```
layout/          — FileExplorer (main shell), ClientFileExplorer (client wrapper),
                   DockControls, DarkModeToggle, Container, ThemeProvider
posts/           — PostsList, ProjectsList, PostNavigation, InlineTableOfContents,
                   ReadingProgress
content/         — MarkdownContent (react-markdown renderer), Block (Editor.js renderer)
providers/       — PostHogProvider
admin/           — AdminSidebar, PostForm, PageForm, ProjectForm, RichEditor (Tiptap)
```

### Auth

Simple env-var comparison — no crypto, no database lookup for sessions:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — compared on login
- `SESSION_SECRET` — set as cookie value on success, checked by middleware
- `src/middleware.ts` — protects `/admin` routes (except login)

### Content Rendering

1. **Markdown (Posts)** — `MarkdownContent.tsx` with `react-markdown` + `remark-gfm`. Custom heading anchors for TOC.
2. **Block Editor (Pages)** — `Block.tsx` renders Editor.js JSON format.
3. **Rich Editor (Admin)** — Tiptap with markdown I/O via `tiptap-markdown`. Supports slash commands, image paste/drop, toolbar.

### Media / Image Handling

- Uploads saved to `UPLOADS_PATH` env var (`/data/uploads` on Railway persistent volume)
- Served via `/uploads/[...path]` API route that reads from disk
- Upload API at `/api/media` returns `{ url: "/uploads/filename" }`
- Editor paste/drop handler uploads to API, inserts URL into content

### Styling

- Tailwind CSS with CSS variable theming (HSL format)
- Dark mode default (class-based), orange accent (HSL 32° 95%)
- Fonts: Inter (sans, article body) + JetBrains Mono (mono, UI)
- Border radius globally 0 (sharp corners)
- `.article-content` class for post typography
- `.prose-editor` class for Tiptap editor styling

### Code Style

- Biome: 2-space indentation, double quotes, auto-organize imports
- TypeScript strict mode, path alias `@/*` → `./src/*`

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (Railway provides via variable reference)
- `SESSION_SECRET` — Cookie value for admin auth
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — Admin login credentials
- `UPLOADS_PATH` — Media storage directory (`/data/uploads` on Railway)
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog analytics
- `NEXT_PUBLIC_BASE_URL` — Site URL for OpenGraph

## Deployment

- Railway with Nixpacks + Bun runtime
- PostgreSQL via Railway addon (variable reference `${{Postgres-BF-f.DATABASE_URL}}`)
- Persistent volume at `/data/uploads` for media
- Health check at `/api/health`
- Auto-deploys on git push to main
- Next.js 14 requires `experimental.serverComponentsExternalPackages: ["pg"]`
- DB queries in data access layer must have try-catch for build-time prerendering
