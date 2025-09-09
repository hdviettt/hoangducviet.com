# Deployment Instructions for hoangducviet.work

## Step 1: Copy Files to Your Blog Project

From this workspace, copy the integration files to your blog workspace:

```bash
# From your blog project root
cp -r /path/to/techcombank/nextjs-integration/pages/* pages/
cp -r /path/to/techcombank/nextjs-integration/lib/* lib/
```

## Step 2: Install Dependencies

No additional dependencies needed if you're using TypeScript NextJS.

## Step 3: Update Your Blog Navigation

Add a link to the new analysis tool in your blog's navigation:

```tsx
// In your navigation component
<Link href="/ai_overviews_analysis">
  <a>AI Analysis Tool</a>
</Link>
```

## Step 4: Style Integration

The page uses Tailwind CSS classes. If your blog uses different styling:

### Option A: Use Tailwind (Recommended)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Option B: Convert to Your CSS System
Replace Tailwind classes with your existing CSS modules or styled-components.

## Step 5: Deploy to Railway

1. **Commit and push** to your repository:
   ```bash
   git add .
   git commit -m "Add AI overviews analysis tool"
   git push
   ```

2. **Railway will auto-deploy** if connected to your repo

3. **Access at**: `https://hoangducviet.work/ai_overviews_analysis`

## Step 6: Optional - Add to Directus

If you want to store analysis results in Directus:

1. **Create Collections** in Directus:
   - `ai_analysis_sessions`
   - `ai_analysis_results`

2. **Update API** to save results:
   ```typescript
   // In analyze.ts
   await saveToDirectus(results);
   ```

## Alternative: Standalone Deployment

If you prefer a separate app on a subdomain:

1. **Create new Railway service**
2. **Set custom domain**: `ai-analysis.hoangducviet.work`
3. **Deploy this as standalone NextJS app**

## Environment Variables (Optional)

Add to Railway if needed:

```env
# For data storage
DATABASE_URL=your_database_url

# For Directus integration
DIRECTUS_URL=your_directus_url
DIRECTUS_TOKEN=your_directus_token

# For file uploads
MAX_FILE_SIZE=52428800
```

## Testing

After deployment, test with sample data:

1. Visit `https://hoangducviet.work/ai_overviews_analysis`
2. Upload one of the JSON files from your techcombank folder
3. Enter brand details
4. Verify CSV downloads work

## Troubleshooting

### Large File Issues
If JSON files are too large:
- Increase body parser limit in `analyze.ts`
- Consider using streaming or chunked uploads

### CORS Issues
If calling from different domain:
```typescript
// In analyze.ts
res.setHeader('Access-Control-Allow-Origin', '*');
```

### Performance
For better performance with large datasets:
- Implement caching
- Use background jobs for processing
- Store results in database