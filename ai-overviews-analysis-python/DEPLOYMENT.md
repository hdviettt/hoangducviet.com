# Deployment Guide - Railway

This guide covers deploying the AI Overviews Analysis Tool to Railway.

## Prerequisites

- Railway account (free tier available)
- GitHub repository with your code
- Railway CLI (optional)

## Method 1: Deploy from GitHub (Recommended)

### 1. Push Code to GitHub

```bash
cd ai-overviews-analysis-python
git init
git add .
git commit -m "Initial commit - AI Overviews Analysis Tool"
git branch -M main
git remote add origin https://github.com/yourusername/ai-overviews-analysis.git
git push -u origin main
```

### 2. Connect to Railway

1. Visit [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect Python and deploy

### 3. Configure Environment Variables

In Railway dashboard → Variables:

```env
ENVIRONMENT=production
TOOL_PASSWORD_AI_OVERVIEWS_ANALYSIS=your_secure_password_here
```

### 4. Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain: `ai-analysis.yourdomain.com`
3. Update DNS records as shown

## Method 2: Railway CLI

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
# or
curl -fsSL https://railway.app/install.sh | sh
```

### 2. Login and Deploy

```bash
cd ai-overviews-analysis-python
railway login
railway init
railway up
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENVIRONMENT` | Yes | Deployment environment | `production` |
| `PORT` | No | Server port (auto-set by Railway) | `8000` |
| `TOOL_PASSWORD_AI_OVERVIEWS_ANALYSIS` | No | Password protection for tool | `your_password` |

## Post-Deployment Checklist

### 1. Test the Deployment

```bash
# Health check
curl https://your-app.railway.app/health

# Expected response:
# {"status":"healthy","timestamp":"2024-01-01T00:00:00.000000"}
```

### 2. Test the Interface

1. Visit your Railway URL
2. Try uploading a small JSON file
3. Test keyword fetching with 1-2 keywords
4. Verify CSV downloads work

### 3. Monitor Performance

- Check Railway logs for errors
- Monitor memory usage (should stay under 512MB)
- Watch for API timeout issues

## Troubleshooting

### Common Issues

**1. Server Won't Start**
```
Check Railway logs:
- Missing dependencies in requirements.txt
- Python version compatibility
- Port binding issues
```

**2. Template Not Found**
```
Ensure templates/index.html is included in git:
git add templates/
git commit -m "Add templates"
git push
```

**3. DataForSEO API Errors**
```
Check:
- API credentials are correct
- Account has sufficient credits
- Rate limiting issues
```

**4. Memory Issues**
```
Reduce concurrency:
- Lower MAX_WORKERS_SAFE to 8
- Lower MAX_WORKERS_FAST to 16
- Add memory limits to processing
```

### Railway-Specific Issues

**Build Fails**
```bash
# Check buildpack detection
railway logs --build

# Force Python buildpack
echo "python" > runtime.txt
```

**App Crashes on Start**
```bash
# Check startup logs
railway logs

# Common fixes:
# 1. Ensure PORT variable is used
# 2. Check requirements.txt is complete
# 3. Verify main.py imports work
```

## Performance Optimization

### 1. Memory Management

```python
# In main.py, add limits:
MAX_CONCURRENT_REQUESTS = 50
MEMORY_LIMIT_MB = 400
```

### 2. Request Timeouts

```python
# Adjust timeouts for Railway:
REQUEST_TIMEOUT = 25.0  # Slightly under Railway's 30s limit
```

### 3. Background Processing

For large keyword sets (>100), consider:
- Breaking into smaller batches
- Using Railway background workers
- Implementing request queuing

## Cost Estimation

### Railway Costs
- **Hobby Plan**: $5/month
  - 512MB RAM, always on
  - Custom domains
  - Sufficient for most usage

### DataForSEO Costs
- ~$0.004 per keyword
- 1000 keywords = ~$4
- Monitor usage in DataForSEO dashboard

## Monitoring Setup

### 1. Health Check Monitoring

Railway provides built-in monitoring via `/health` endpoint.

### 2. Custom Monitoring

Add to your monitoring service:
```bash
# HTTP check
GET https://your-app.railway.app/health
Expected: 200 OK with {"status":"healthy"}

# Response time check  
Target: < 2 seconds
```

### 3. Log Monitoring

Watch Railway logs for:
- API failures
- Memory warnings
- Timeout errors
- High processing times

## Scaling Considerations

### When to Scale

Scale up if you see:
- Memory usage > 80%
- Regular timeout errors
- Queue backlogs
- User complaints about speed

### Scaling Options

1. **Vertical Scaling**: Upgrade Railway plan
2. **Optimize Code**: Reduce memory usage
3. **Background Jobs**: Move processing off-request
4. **Caching**: Cache analysis results

## Security Best Practices

### 1. Environment Variables

Never commit:
- API credentials
- Passwords
- Production URLs

### 2. CORS Configuration

Update for production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specific domains
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

Consider adding:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/ai-analysis/fetch-keywords-stream")
@limiter.limit("5/minute")  # Limit API calls
async def fetch_keywords_stream(...):
```

## Support

If deployment fails:

1. Check [Railway status](https://status.railway.app)
2. Review Railway logs for specific errors
3. Test locally with `python run_local.py`
4. Verify all files are committed to git
5. Check Railway community Discord for help

## Migration from Next.js

Your existing Next.js version will continue to work. You can:

1. Deploy Python version to new Railway service
2. Test with real data
3. Update DNS to point to Python version
4. Keep Next.js as backup during transition