import { NextRequest } from "next/server";

// Removed edge runtime - using Node.js runtime for better compatibility

// DataForSEO API configuration
const DATAFORSEO_URL = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced";
const DATAFORSEO_AUTH = "Basic YWl0ZWFtQHNlb25nb24uY29tOjcyMmU2MzI4OGU4NzRmMzk=";

// Performance tuning optimized for Node.js runtime
const MAX_WORKERS_SAFE = 12; // Reduced for better Node.js performance
const MAX_WORKERS_FAST = 20; // Fast mode but reasonable for Node.js

// Delay between batches to avoid rate limiting  
const BATCH_DELAY_SAFE = 200; // milliseconds - safe mode
const BATCH_DELAY_FAST = 0;   // Fast mode - no delays

// Timeout for individual keyword requests - reduced for better reliability
const REQUEST_TIMEOUT = 25000; // 25s to stay under typical server limits

interface KeywordRequest {
  keywords: string[];
  brandName: string;
  brandDomain: string;
  locationCode?: number;
  languageCode?: string;
  fastMode?: boolean; // New fast mode option
}

async function fetchDataForSEO(keyword: string, locationCode: number = 2704, languageCode: string = "vi") {
  const payload = JSON.stringify([{
    keyword: keyword,
    location_code: locationCode,
    language_code: languageCode,
    depth: 10,
    group_organic_results: true,
    load_async_ai_overview: true
  }]);

  try {
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(DATAFORSEO_URL, {
      method: "POST",
      headers: {
        "Authorization": DATAFORSEO_AUTH,
        "Content-Type": "application/json"
      },
      body: payload,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DataForSEO API error for "${keyword}":`, response.status);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0]) {
      // DataForSEO returns an array with one element, extract it to match pandas behavior
      return data.tasks[0].result[0];
    }

    throw new Error("Invalid response structure");
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request timeout for keyword "${keyword}"`);
    } else {
      console.error(`Error fetching keyword "${keyword}":`, error);
    }
    return null;
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a ReadableStream for Node.js runtime compatibility
  const stream = new ReadableStream({
    start(controller) {
      // Store controller for writing data
      (async () => {
        try {
          await processKeywords(request, controller, encoder);
        } catch (error) {
          console.error('Stream processing error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`));
        } finally {
          controller.close();
        }
      })();
    }
  });

  // Return the stream as Server-Sent Events
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function processKeywords(
  request: NextRequest, 
  controller: ReadableStreamDefaultController<Uint8Array>, 
  encoder: TextEncoder
) {
  const { keywords, brandName, brandDomain, locationCode = 2704, languageCode = "vi", fastMode = false }: KeywordRequest = await request.json();

  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'error',
      message: 'No keywords provided'
    })}\n\n`));
    return;
  }

  const cleanedKeywords = keywords
    .map(k => k.trim())
    .filter(k => k.length > 0);

  // Log keyword processing for debugging
  console.log(`Original keywords: ${keywords.length}, Cleaned keywords: ${cleanedKeywords.length}`);
  if (keywords.length !== cleanedKeywords.length) {
    console.log(`Filtered out ${keywords.length - cleanedKeywords.length} empty/whitespace keywords`);
  }

  // Configure performance based on mode
  const MAX_WORKERS = fastMode ? MAX_WORKERS_FAST : MAX_WORKERS_SAFE;
  const BATCH_DELAY = fastMode ? BATCH_DELAY_FAST : BATCH_DELAY_SAFE;

  // Send initial status
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: 'start',
    total: cleanedKeywords.length,
    mode: fastMode ? 'fast' : 'safe',
    originalCount: keywords.length,
    filteredCount: keywords.length - cleanedKeywords.length
  })}\n\n`));

  const results: any[] = [];
  let successCount = 0;
  let failCount = 0;
  let completedCount = 0;

  if (fastMode) {
    // FAST MODE: Process all keywords at once
    console.log(`Starting FAST mode processing of ${cleanedKeywords.length} keywords with limited concurrency`);
    
    // Start all requests simultaneously but with concurrency control
    const allPromises = cleanedKeywords.map(async (keyword) => {
      try {
        const result = await fetchDataForSEO(keyword, locationCode, languageCode);
        return { keyword, result, success: result !== null };
      } catch (error) {
        console.error(`Fast mode error for keyword "${keyword}":`, error);
        return { keyword, result: null, success: false };
      }
    });

    // Wait for all promises to settle and track progress
    const allResults = await Promise.allSettled(allPromises);
    
    // Process all results and maintain keyword order
    allResults.forEach((settledResult) => {
      completedCount++;
      
      if (settledResult.status === 'fulfilled') {
        const { keyword, result, success } = settledResult.value;
        if (success && result) {
          results.push({ ...result, keyword });
          successCount++;
        } else {
          results.push({ keyword, failed: true, reason: "API call failed" });
          failCount++;
        }
      } else {
        results.push({ keyword: 'unknown', failed: true, reason: settledResult.reason });
        failCount++;
        console.error('Promise rejected in fast mode:', settledResult.reason);
      }

      // Send progress update every 20 completions or at the end
      if (completedCount % 20 === 0 || completedCount === cleanedKeywords.length) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'progress',
          current: completedCount,
          total: cleanedKeywords.length,
          successful: successCount,
          failed: failCount
        })}\n\n`));
      }
    });
  } else {
    // SAFE MODE: Process in batches with better error resilience
    for (let i = 0; i < cleanedKeywords.length; i += MAX_WORKERS) {
      const batch = cleanedKeywords.slice(i, Math.min(i + MAX_WORKERS, cleanedKeywords.length));
      console.log(`Processing batch ${Math.floor(i / MAX_WORKERS) + 1}/${Math.ceil(cleanedKeywords.length / MAX_WORKERS)} (${batch.length} keywords)`);

      // Process batch with individual error handling
      const batchPromises = batch.map(async (keyword) => {
        try {
          const result = await fetchDataForSEO(keyword, locationCode, languageCode);
          return { keyword, result, success: result !== null };
        } catch (error) {
          console.error(`Batch error for keyword "${keyword}":`, error);
          return { keyword, result: null, success: false };
        }
      });

      // Use Promise.allSettled to handle individual failures
      const settledResults = await Promise.allSettled(batchPromises);

      // Process results regardless of individual failures
      settledResults.forEach((settledResult) => {
        completedCount++;
        
        if (settledResult.status === 'fulfilled') {
          const { keyword, result, success } = settledResult.value;
          if (success && result) {
            results.push({ ...result, keyword });
            successCount++;
          } else {
            results.push({ keyword, failed: true, reason: "API call failed" });
            failCount++;
          }
        } else {
          results.push({ keyword: 'unknown', failed: true, reason: settledResult.reason });
          failCount++;
          console.error('Promise rejected in batch:', settledResult.reason);
        }
      });

      // Small delay between batches in safe mode
      if (BATCH_DELAY > 0 && i + MAX_WORKERS < cleanedKeywords.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
      
      // Send progress update
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'progress',
        current: completedCount,
        total: cleanedKeywords.length,
        successful: successCount,
        failed: failCount,
        batch: Math.floor(i / MAX_WORKERS) + 1,
        totalBatches: Math.ceil(cleanedKeywords.length / MAX_WORKERS)
      })}\n\n`));
    }
  }

  // Create the final data structure
  const apiData = {
    "0": Object.fromEntries(
      results.map((result, index) => [index.toString(), result])
    )
  };

  console.log(`Final results: ${results.length} total (should match ${cleanedKeywords.length}), ${successCount} successful, ${failCount} failed`);

  // Now analyze the data
  controller.enqueue(encoder.encode(`data: ${JSON.stringify({
    type: 'analyzing',
    message: 'Processing analysis...'
  })}\n\n`));

  // Call the analyze endpoint - use internal HTTP call to avoid SSL issues
  const port = process.env.PORT || '3000';
  const baseUrl = `http://localhost:${port}`;
  
  const analyzeResponse = await fetch(`${baseUrl}/api/ai-analysis/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandName,
      brandDomain,
      data: apiData
    })
  });

  if (analyzeResponse.ok) {
    const analysisResult = await analyzeResponse.json();

    // Send completion with results and raw data
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'complete',
      results: analysisResult.results,
      rawData: apiData,
      stats: {
        requested: cleanedKeywords.length,
        successful: successCount,
        failed: failCount
      }
    })}\n\n`));
  } else {
    throw new Error('Analysis failed');
  }
}