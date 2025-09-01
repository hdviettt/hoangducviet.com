# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 blog application integrated with Directus CMS. The project uses TypeScript, React 18, Tailwind CSS, and Biome for linting/formatting.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code (using Biome)
npm run lint

# Format code (using Biome)
npm run format

# Type checking (no dedicated script, use directly)
npx tsc --noEmit
```

## Architecture

### Core Integration
The application connects to a Directus CMS instance via the `@directus/sdk`. The Directus API endpoint must be configured in environment variables:
- `NEXT_PUBLIC_DIRECTUS_API_ENDPOINT` - The Directus instance URL

### Data Models
The application expects these Directus collections:
- `global` - Site-wide metadata (title, tagline)
- `home` - Homepage content with hero section, services, quotes, and featured posts
- `posts` - Blog posts with block editor content and categories
- `post_categories` - Post categorization
- `pages` - Dynamic pages with block editor content
- `courses` - Course listings with optional navigation display

### Key Libraries
- **Directus SDK** (`src/lib/directus.ts`) - Central client configuration with REST adapter
- **Data fetching** - Separate modules for posts, pages, and courses in `src/lib/`
- **Block rendering** - Custom Block component (`src/components/Block.tsx`) renders Directus block editor content
- **UI Components** - Radix UI primitives with Tailwind styling

### Code Style
- **Formatter**: Biome with 2-space indentation
- **Quotes**: Double quotes for strings
- **TypeScript**: Strict mode enabled
- **Linting**: Comprehensive Biome rules including React hooks, accessibility, and security checks

## Environment Configuration

Create a `.env.local` file with:
```
NEXT_PUBLIC_DIRECTUS_API_ENDPOINT="<Your Directus URL>"
```

## Image Handling
Remote images from Directus are configured in `next.config.mjs`. The hostname is automatically extracted from the Directus endpoint environment variable.