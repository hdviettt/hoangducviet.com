# Cloudflare Pages Deployment Instructions

## Prerequisites Completed ✅
- Created `wrangler.jsonc` configuration
- Updated `next.config.mjs` with Cloudflare setup
- Updated `package.json` with deployment scripts
- Added `.npmrc` file to handle dependency conflicts

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
   - **Build output directory**: Leave empty (Cloudflare will auto-detect)
   - **Root directory**: Leave empty
   
   Note: The `.npmrc` file in the repository will handle the dependency conflicts

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
- Check that environment variables are set in Cloudflare dashboard
- Verify Node.js version is 18 or higher
- The `.npmrc` file handles dependency conflicts

### Windows Issues
- Use WSL (Windows Subsystem for Linux) for local builds
- Or deploy via Git integration (recommended)

## Important Files
- `wrangler.jsonc` - Cloudflare configuration
- `next.config.mjs` - Next.js config with Cloudflare setup
- `.npmrc` - NPM configuration to handle dependency conflicts