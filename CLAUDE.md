# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 14 blog with Directus CMS, TypeScript, React 18, Tailwind CSS, and Biome. Terminal-themed design using JetBrains Mono font and orange accent color. Deployed on Railway via Nixpacks with Bun as the runtime.

## Development Commands

```bash
npm run dev          # Start dev server (uses Bun under the hood)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint with Biome
npm run format       # Format with Biome (auto-fix)
npx --package typescript tsc --noEmit   # Type check (typescript not in PATH directly)
```

## Architecture

### Routing (App Router)

- `/` — Homepage (profile, recent posts)
- `/posts` — Post list grouped by year
- `/posts/[postSlug]` — Post detail with TOC sidebar and prev/next navigation
- `/projects` — Project list
- `/projects/[projectSlug]` — Project detail with related posts
- `/[pageSlug]` — Dynamic pages (Directus block editor content)
- `/api/health` — Health check for Railway deployment

### Layout Shell

`FileExplorer.tsx` is the main layout wrapper (client component, uses `usePathname()`). It provides:
- Sticky terminal-style header showing `user@blog:~path`
- Navigation bar with active link highlighting
- Social icons and theme toggle (dark mode default, persisted to localStorage)
- Content area: `max-w-5xl` on post detail pages, `max-w-4xl` elsewhere

Wrapped by `ClientFileExplorer.tsx` → `ThemeProvider` → `PostHogProvider` in root layout.

### Two Content Rendering Pipelines

1. **Markdown (Posts/Projects)** — `MarkdownContent.tsx` renders content via `react-markdown` + `remark-gfm`. Custom heading components generate anchor IDs. Styled by `.article-content` class in `globals.css` (uses Inter/sans font for readability).

2. **Block Editor (Pages)** — `Block.tsx` renders Directus Editor.js block format (header, paragraph, list, image). Used for `/[pageSlug]` routes.

### Data Fetching Layer (`src/lib/`)

- `directus.ts` — Directus SDK client with REST adapter, 60-second revalidation. Exports `getCollectionById()` and `getItemById()` helpers.
- `posts.ts` — `getPosts()`, `getPostBySlug()`, `getAdjacentPosts()`. Filters by `status: "published"`.
- `pages.ts` — `getPages()`, `getPageBySlug()`
- `projects.ts` — `getProjects()`, `getProjectBySlug()`. Projects have many-to-many relationship with posts.

All data fetching is server-side only (called in server components). Errors are caught and return empty arrays.

### Directus Collections

- `global` — Site metadata (title, tagline)
- `hdviet` — Profile/author data (name, description, image)
- `home` — Homepage content (hero, featured posts)
- `posts` — Blog posts (markdown content, categories, thumbnail)
- `post_categories` — Post categorization
- `pages` — Dynamic pages (block editor content)
- `projects` — Project listings with post relations
- `courses` — Course listings (optional nav display)

### Component Patterns

- **Server components** for pages/layouts that fetch data
- **Client components** (`"use client"`) for interactivity: `FileExplorer`, `PostsList`, `InlineTableOfContents`, `ThemeProvider`, `ReadingProgress`
- Path alias: `@/*` maps to `./src/*`

### Styling

- **Tailwind** with CSS variable theming (HSL format). Border radius globally `0` (sharp corners).
- **Primary/accent color**: Orange (HSL 32° 95%)
- **Fonts**: Inter (sans, article body) + JetBrains Mono (mono, UI/code)
- **Dark mode**: Class-based (`dark` class on html), default theme, early script prevents flash
- **`.article-content`** class in `globals.css` controls all post typography — headings are orange, h2 has bottom border, code blocks use monospace, blockquotes have orange left border

### Code Style

- **Biome**: 2-space indentation, double quotes, auto-organize imports
- **TypeScript**: Strict mode

## Environment Variables

- `NEXT_PUBLIC_DIRECTUS_API_ENDPOINT` — Directus instance URL (also hardcoded in `next.config.mjs`)
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog analytics key
- `NEXT_PUBLIC_BASE_URL` — Site URL for OpenGraph metadata (fallback: `https://yourdomain.com`)

## Deployment

Deployed on Railway with Nixpacks. Uses Bun (not npm) for install/build/start. Health check at `/api/health`. PostHog analytics proxied through `/ingest` rewrites in `next.config.mjs`.
