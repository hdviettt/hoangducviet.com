# Personal Blog

A personal blog built with Next.js 14 and Directus CMS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **CMS**: Directus
- **Styling**: Tailwind CSS, Radix UI
- **Linting**: Biome
- **Analytics**: PostHog, Google Analytics
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Data fetching and utilities
└── types/         # TypeScript definitions
```

## License

Private
