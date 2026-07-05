# hoangducviet.com

Personal blog and identity site for Hoang Duc Viet, built with Next.js 14 and a
custom CMS admin panel. Material 3 visual system, entity-SEO focused.

## Tech stack

- **Framework:** Next.js 14 (App Router), TypeScript (strict)
- **Content / CMS:** custom `/admin` panel with a Tiptap rich-text editor
- **Database:** PostgreSQL via Drizzle ORM
- **Styling:** Tailwind CSS on a Material 3 design-token system (Google Blue, DM Sans)
- **Media:** local persistent volume or Cloudflare R2
- **Analytics:** PostHog + Google Analytics
- **Tooling:** Bun runtime, Biome (lint + format)
- **Deployment:** Railway (Nixpacks)

## Getting started

Requires [Bun](https://bun.sh) and a PostgreSQL database (`DATABASE_URL`).

```bash
bun install
bun run dev        # http://localhost:3000
```

To run against the production database, prefix with the Railway CLI (the Postgres
service is named `database`):

```bash
railway run --service database bun run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build |
| `bun run start` | Start the production server |
| `bun run lint` | Lint with Biome |
| `bun run format` | Format with Biome (auto-fix) |
| `bunx tsc --noEmit` | Type-check |

## Project structure

```
src/
├── app/          # App Router routes (public site, /admin, /api)
├── components/   # React components (layout, posts, admin, content, widgets)
├── db/           # Drizzle schema + client
├── lib/          # Data access + helpers (posts, series, jsonld, auth, …)
└── middleware.ts # Admin auth guard
drizzle/          # Hand-written SQL migrations
scripts/          # Content-management CLI helpers
```

## Routes at a glance

- `/` — homepage (profile + writing feed)
- `/posts` — writing archive · `/posts/[slug]` — individual post (canonical URL)
- `/series/[slug]` — series landing page
- `/about` — about page
- `/admin/*` — CMS admin (auth required)
- `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/llms.txt` — feeds & SEO

## Architecture notes

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture: routing model, database
schema, data-access layer, the Material 3 styling system, and deployment.

## License

Private — all rights reserved.
