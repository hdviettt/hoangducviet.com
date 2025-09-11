# AI Overviews Analysis Tool - Python FastAPI Version

A powerful tool for analyzing search engine AI overview citations and competitor mentions using DataForSEO API. This Python version provides better performance and easier deployment compared to the Next.js edge runtime version.

## Features

- **Keyword Fetching**: Automatically fetch search results from DataForSEO API
- **AI Overview Analysis**: Extract and analyze AI-generated overviews from search results  
- **Citation Analysis**: Track which sources are cited in AI overviews and their ranking positions
- **Competitor Analysis**: Identify most cited competitors and their citation probabilities
- **Brand Mention Analysis**: Detect brand mentions in AI overview content
- **Real-time Progress**: Stream processing updates with Server-Sent Events
- **Multiple Processing Modes**: Safe mode (batched) vs Fast mode (parallel)
- **Data Export**: Download results as CSV and JSON files

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### 3. Run Locally

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Visit `http://localhost:8000` to access the application.

## Railway Deployment

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Connect your Railway account to GitHub
3. Create new project from your repository
4. Railway will automatically detect Python and deploy

### Option 2: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Environment Variables for Production

Set these in Railway dashboard:

```env
ENVIRONMENT=production
TOOL_PASSWORD_AI_OVERVIEWS_ANALYSIS=your_secure_password
```

## API Endpoints

### Core Analysis Endpoints

- `POST /api/ai-analysis/fetch-keywords-stream` - Stream keyword fetching and analysis
- `POST /api/ai-analysis/analyze` - Analyze uploaded DataForSEO JSON data
- `POST /api/tools/verify-password` - Verify tool password protection

### Utility Endpoints

- `GET /` - Main application interface
- `GET /health` - Health check for monitoring
- `GET /docs` - Interactive API documentation

## Usage

### Fetch Keywords Mode

1. Enter brand name and domain
2. Add keywords (one per line or upload CSV)
3. Choose processing mode:
   - **Safe Mode**: Batched processing with delays (16 workers)
   - **Fast Mode**: Parallel processing (32 workers)
4. Click "Fetch & Analyze"

### Upload JSON Mode

1. Enter brand name and domain  
2. Upload DataForSEO JSON file
3. Click "Analyze Data"

## Data Processing Workflow

1. **Load Data**: Accept keywords or JSON file
2. **Fetch Results**: Query DataForSEO API for search results
3. **Extract AI Overviews**: Filter results with AI overview content
4. **Process Citations**: Clean markdown and extract references
5. **Competitor Analysis**: Aggregate citation data by domain/source
6. **Brand Analysis**: Calculate citation rates and mention frequencies
7. **Export Results**: Generate CSV/JSON downloads

## Key Differences from Next.js Version

### Advantages ✅

- **No Edge Runtime Limitations**: Full Python environment with all libraries
- **Better Concurrency**: Native async/await for API calls
- **Simpler Deployment**: No CloudFlare Pages compatibility issues
- **More Reliable**: Fewer timeout and memory constraints
- **Better Error Handling**: Comprehensive exception management
- **Faster Processing**: Optimized async HTTP calls with aiohttp

### Architecture Changes

- **FastAPI** instead of Next.js API routes
- **Server-Sent Events** for real-time progress (same as before)
- **Vanilla JavaScript** frontend instead of React (simpler deployment)
- **Jinja2 templates** for HTML rendering
- **Railway** deployment instead of CloudFlare Pages

## Performance Configuration

```python
# Adjust these values in main.py based on your needs
MAX_WORKERS_SAFE = 16    # Safe mode concurrency
MAX_WORKERS_FAST = 32    # Fast mode concurrency  
BATCH_DELAY_SAFE = 0.2   # Delay between batches (seconds)
REQUEST_TIMEOUT = 30.0   # API request timeout
```

## Cost Estimation

- **DataForSEO API**: ~$0.004 per keyword
- **Railway Hosting**: $5/month for starter plan
- **Processing Time**: 
  - Safe Mode: ~1.5-2s per keyword (batched)
  - Fast Mode: ~2-5s total (parallel)

## Monitoring and Logging

The application includes:

- Health check endpoint at `/health`
- Request/response logging
- Error tracking with detailed stack traces
- Performance metrics for API calls

## Security

- Optional password protection per tool
- CORS configuration for production
- Input validation with Pydantic models
- Secure file upload handling

## Support

For issues or questions:

1. Check the `/docs` endpoint for API documentation
2. Review logs in Railway dashboard
3. Test locally with `python main.py`
4. Verify DataForSEO API credentials and quotas

## Migration from Next.js

If migrating from the Next.js version:

1. All functionality is preserved
2. API endpoints have the same paths
3. Data formats are identical
4. Frontend interface is nearly identical
5. No data migration needed