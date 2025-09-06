# Cloudflare Pages Deployment Instructions

## Prerequisites Completed ✅
- Created `wrangler.jsonc` configuration
- Updated `next.config.mjs` with Cloudflare setup
- Added Edge runtime to dynamic routes
- Updated `package.json` with deployment scripts

## Deployment via Cloudflare Dashboard (Recommended for Windows)

Since the local build has issues on Windows, deploy using Cloudflare's Git integration:

### 1. Push Code to Git Repository
```bash
git add .
git commit -m "Add Cloudflare Pages configuration"
git push origin main
```

### 2. Deploy on Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** > **Create application** > **Pages**
3. Connect your GitHub/GitLab account
4. Select your repository: `directus-blog`
5. Configure build settings:
   - **Framework preset**: Select `None` (important - do not select Next.js)
   - **Build command**: `npx @cloudflare/next-on-pages@1`
   - **Build output directory**: Leave empty or try `.vercel/output/static`
   - **Root directory**: Leave empty
   
   Note: If the deployment fails with the output directory, try these alternatives:
   - Leave output directory completely empty
   - Use `/` 
   - Use `.vercel/output/static`

### 3. Environment Variables
Add these in Cloudflare Pages settings:
- `NEXT_PUBLIC_DIRECTUS_API_ENDPOINT`: `https://directus-production-8b7b.up.railway.app`
- `NODE_VERSION`: `18` (or higher)

### 4. Compatibility Flags
In **Settings** > **Functions** > **Compatibility flags**, add:
- `nodejs_compat`

### 5. Deploy
Click **Save and Deploy**

## Alternative: Local Build (Linux/Mac/WSL)

If using Linux, Mac, or Windows Subsystem for Linux:

```bash
# Build for Cloudflare Pages
npm run pages:build

# Deploy directly
npm run deploy
```

## Troubleshooting

### Build Errors
- Ensure all dynamic routes have `export const runtime = "edge"`
- Check that environment variables are set in Cloudflare dashboard
- Verify Node.js version is 18 or higher

### Windows Issues
- Use WSL (Windows Subsystem for Linux) for local builds
- Or deploy via Git integration (recommended)

## Important Files
- `wrangler.jsonc` - Cloudflare configuration
- `next.config.mjs` - Next.js config with Cloudflare setup
- Dynamic routes with Edge runtime:
  - `/src/app/[pageSlug]/page.tsx`
  - `/src/app/posts/[postSlug]/page.tsx`
  - `/src/app/projects/[projectSlug]/page.tsx`