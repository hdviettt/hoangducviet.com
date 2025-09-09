# NextJS Integration Guide

## Setup Instructions

1. **Copy these files to your blog project**:
   ```bash
   # From your blog workspace root
   cp -r /path/to/techcombank/nextjs-integration/* .
   ```

2. **Install dependencies**:
   ```bash
   npm install formidable csv-parser papaparse
   ```

3. **Add environment variable** (optional):
   ```env
   ANALYSIS_DATA_PATH=/path/to/data/files
   ```

## File Structure

Add these to your existing NextJS blog:

```
your-blog/
├── pages/
│   ├── api/
│   │   └── ai-analysis/
│   │       ├── analyze.ts
│   │       ├── brands.ts
│   │       └── upload.ts
│   └── ai_overviews_analysis.tsx
├── lib/
│   └── seo-analyzer/
│       ├── types.ts
│       ├── analyzer.ts
│       └── data-processor.ts
└── components/
    └── ai-analysis/
        ├── UploadForm.tsx
        ├── ResultsTable.tsx
        └── CompetitorChart.tsx
```

## Deployment to Railway

1. Push to your existing blog repo
2. Railway will automatically deploy
3. Access at: hoangducviet.work/ai_overviews_analysis

## API Endpoints

- `GET /api/ai-analysis/brands` - List available brands
- `POST /api/ai-analysis/analyze` - Run analysis
- `POST /api/ai-analysis/upload` - Upload JSON file
- `GET /api/ai-analysis/results?id=xxx` - Get results