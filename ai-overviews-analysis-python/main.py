from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import asyncio
import aiohttp
import os
from typing import List, Optional, Dict, Any
import pandas as pd
from dotenv import load_dotenv
from datetime import datetime

from analyzer import analyze_data, BrandConfig
from models import AnalysisRequest, KeywordFetchRequest

load_dotenv()

app = FastAPI(
    title="AI Overviews Analysis Tool",
    description="Analyze search engine AI overview citations and competitor mentions",
    version="1.0.0"
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# DataForSEO API configuration
DATAFORSEO_URL = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced"
DATAFORSEO_AUTH = "Basic YWl0ZWFtQHNlb25nb24uY29tOjcyMmU2MzI4OGU4NzRmMzk="

# Performance configuration
MAX_WORKERS_SAFE = 16
MAX_WORKERS_FAST = 32
BATCH_DELAY_SAFE = 0.2  # seconds
BATCH_DELAY_FAST = 0.0
REQUEST_TIMEOUT = 30.0


@app.get("/")
async def root():
    """Serve the main application page"""
    template_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    if os.path.exists(template_path):
        return FileResponse(template_path)
    return {"message": "AI Overviews Analysis API", "docs_url": "/docs"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


async def fetch_dataforseo_keyword(
    session: aiohttp.ClientSession,
    keyword: str,
    location_code: int = 2704,
    language_code: str = "vi"
) -> Optional[Dict[str, Any]]:
    """Fetch data for a single keyword from DataForSEO API"""
    payload = {
        "keyword": keyword,
        "location_code": location_code,
        "language_code": language_code,
        "depth": 10,
        "group_organic_results": True,
        "load_async_ai_overview": True
    }

    try:
        timeout = aiohttp.ClientTimeout(total=REQUEST_TIMEOUT)
        async with session.post(
            DATAFORSEO_URL,
            json=[payload],
            headers={
                "Authorization": DATAFORSEO_AUTH,
                "Content-Type": "application/json"
            },
            timeout=timeout
        ) as response:
            if response.status != 200:
                print(f"DataForSEO API error for '{keyword}': {response.status}")
                return None

            data = await response.json()
            
            if (data.get("tasks") and 
                data["tasks"][0] and 
                data["tasks"][0].get("result") and 
                data["tasks"][0]["result"][0]):
                return data["tasks"][0]["result"][0]
                
            return None
            
    except asyncio.TimeoutError:
        print(f"Request timeout for keyword '{keyword}'")
        return None
    except Exception as e:
        print(f"Error fetching keyword '{keyword}': {e}")
        return None


@app.post("/api/ai-analysis/fetch-keywords-stream")
async def fetch_keywords_stream(request: KeywordFetchRequest):
    """Stream keyword fetching process with real-time progress updates"""
    
    async def generate_stream():
        keywords = [k.strip() for k in request.keywords if k.strip()]
        
        if not keywords:
            yield f"data: {json.dumps({'type': 'error', 'message': 'No keywords provided'})}\n\n"
            return

        # Configuration based on mode
        max_workers = MAX_WORKERS_FAST if request.fast_mode else MAX_WORKERS_SAFE
        batch_delay = BATCH_DELAY_FAST if request.fast_mode else BATCH_DELAY_SAFE
        
        # Send initial status
        yield f"data: {json.dumps({
            'type': 'start',
            'total': len(keywords),
            'mode': 'fast' if request.fast_mode else 'safe',
            'originalCount': len(request.keywords),
            'filteredCount': len(request.keywords) - len(keywords)
        })}\n\n"

        results = []
        success_count = 0
        fail_count = 0
        completed_count = 0

        async with aiohttp.ClientSession() as session:
            if request.fast_mode:
                # Fast mode: Process all keywords simultaneously
                print(f"Starting FAST mode processing of {len(keywords)} keywords")
                
                tasks = [
                    fetch_dataforseo_keyword(
                        session, keyword, request.location_code, request.language_code
                    ) for keyword in keywords
                ]
                
                # Wait for all tasks to complete
                keyword_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                for i, (keyword, result) in enumerate(zip(keywords, keyword_results)):
                    completed_count += 1
                    
                    if isinstance(result, Exception):
                        results.append({"keyword": keyword, "failed": True, "reason": str(result)})
                        fail_count += 1
                    elif result is not None:
                        results.append({**result, "keyword": keyword})
                        success_count += 1
                    else:
                        results.append({"keyword": keyword, "failed": True, "reason": "API call failed"})
                        fail_count += 1
                    
                    # Send progress update every 20 completions or at the end
                    if completed_count % 20 == 0 or completed_count == len(keywords):
                        yield f"data: {json.dumps({
                            'type': 'progress',
                            'current': completed_count,
                            'total': len(keywords),
                            'successful': success_count,
                            'failed': fail_count
                        })}\n\n"
            else:
                # Safe mode: Process in batches
                for i in range(0, len(keywords), max_workers):
                    batch = keywords[i:min(i + max_workers, len(keywords))]
                    batch_num = i // max_workers + 1
                    total_batches = (len(keywords) + max_workers - 1) // max_workers
                    
                    print(f"Processing batch {batch_num}/{total_batches} ({len(batch)} keywords)")
                    
                    # Process batch
                    batch_tasks = [
                        fetch_dataforseo_keyword(
                            session, keyword, request.location_code, request.language_code
                        ) for keyword in batch
                    ]
                    
                    batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                    
                    for keyword, result in zip(batch, batch_results):
                        completed_count += 1
                        
                        if isinstance(result, Exception):
                            results.append({"keyword": keyword, "failed": True, "reason": str(result)})
                            fail_count += 1
                        elif result is not None:
                            results.append({**result, "keyword": keyword})
                            success_count += 1
                        else:
                            results.append({"keyword": keyword, "failed": True, "reason": "API call failed"})
                            fail_count += 1
                    
                    # Delay between batches
                    if batch_delay > 0 and i + max_workers < len(keywords):
                        await asyncio.sleep(batch_delay)
                    
                    # Send progress update
                    yield f"data: {json.dumps({
                        'type': 'progress',
                        'current': completed_count,
                        'total': len(keywords),
                        'successful': success_count,
                        'failed': fail_count,
                        'batch': batch_num,
                        'totalBatches': total_batches
                    })}\n\n"

        # Analyze the data
        yield f"data: {json.dumps({'type': 'analyzing', 'message': 'Processing analysis...'})}\n\n"
        
        # Create data structure for analysis
        api_data = {
            "0": {str(i): result for i, result in enumerate(results)}
        }
        
        try:
            config = BrandConfig(name=request.brand_name, domain=request.brand_domain)
            analysis_results = await analyze_data(api_data, config)
            
            # Send completion
            yield f"data: {json.dumps({
                'type': 'complete',
                'results': analysis_results,
                'rawData': api_data,
                'stats': {
                    'requested': len(keywords),
                    'successful': success_count,
                    'failed': fail_count
                }
            })}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'Analysis failed: {str(e)}'})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/event-stream")


@app.post("/api/ai-analysis/analyze")
async def analyze_uploaded_data(request: AnalysisRequest):
    """Analyze uploaded DataForSEO JSON data"""
    try:
        config = BrandConfig(name=request.brand_name, domain=request.brand_domain)
        results = await analyze_data(request.data, config)
        
        return {
            "success": True,
            "results": results,
            "summary": {
                "totalKeywords": len(results["keywords"]),
                "aiOverviewCount": len(results["aiOverviews"]),
                "competitorCount": len(results["competitors"]),
                "brandMentions": results["brandMentions"]
            }
        }
    except Exception as e:
        print(f"Analysis error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )


@app.post("/api/tools/verify-password")
async def verify_password(tool_slug: str, password: str):
    """Verify tool password (simplified for Python version)"""
    # Get password from environment variable
    env_password_key = f"TOOL_PASSWORD_{tool_slug.upper().replace('-', '_')}"
    tool_password = os.getenv(env_password_key)
    
    if not tool_password:
        # Tool has no password protection
        return {"valid": True}
    
    # Simple password comparison
    is_valid = password == tool_password
    return {"valid": is_valid}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )