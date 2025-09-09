import { NextRequest } from "next/server";

// DataForSEO API configuration
const DATAFORSEO_URL = "https://api.dataforseo.com/v3/serp/google/organic/live/advanced";
const DATAFORSEO_AUTH = "Basic YWl0ZWFtQHNlb25nb24uY29tOjcyMmU2MzI4OGU4NzRmMzk=";

// Performance tuning - Similar to Python's MAX_WORKERS
// Increase MAX_WORKERS to process more keywords simultaneously (faster)
// Your Python script used MAX_WORKERS = 32, but start lower and increase if API allows
const MAX_WORKERS = 32; // Number of concurrent requests (Python had 32-64)

// Delay between batches to avoid rate limiting
// Decrease for faster processing, increase if getting rate limited
const BATCH_DELAY = 100; // milliseconds (Python didn't have explicit delay)

interface KeywordRequest {
  keywords: string[];
  brandName: string;
  brandDomain: string;
  locationCode?: number;
  languageCode?: string;
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
    const response = await fetch(DATAFORSEO_URL, {
      method: "POST",
      headers: {
        "Authorization": DATAFORSEO_AUTH,
        "Content-Type": "application/json"
      },
      body: payload
    });

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
    console.error(`Error fetching keyword "${keyword}":`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  // Create a TransformStream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Start processing in background
  (async () => {
    try {
      const { keywords, brandName, brandDomain, locationCode = 2704, languageCode = "vi" }: KeywordRequest = await request.json();

      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          message: 'No keywords provided'
        })}\n\n`));
        await writer.close();
        return;
      }

      const cleanedKeywords = keywords
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 100); // Limit to 100 for safety

      // Send initial status
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        type: 'start',
        total: cleanedKeywords.length
      })}\n\n`));

      const results: any[] = [];
      let successCount = 0;
      let failCount = 0;
      let completedCount = 0;

      // Process keywords in batches with concurrency (like Python's ThreadPoolExecutor)
      for (let i = 0; i < cleanedKeywords.length; i += MAX_WORKERS) {
        const batch = cleanedKeywords.slice(i, Math.min(i + MAX_WORKERS, cleanedKeywords.length));

        // Send progress update for batch start
        for (const keyword of batch) {
          await writer.write(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            current: completedCount,
            total: cleanedKeywords.length,
            keyword: keyword,
            status: 'fetching'
          })}\n\n`));
        }

        // Process batch concurrently (like Python's executor.map)
        const batchPromises = batch.map(async (keyword) => {
          try {
            const result = await fetchDataForSEO(keyword, locationCode, languageCode);
            return { keyword, result, success: result !== null };
          } catch (error) {
            return { keyword, result: null, success: false };
          }
        });

        // Wait for all in batch to complete
        const batchResults = await Promise.all(batchPromises);

        // Process results and send updates
        for (const { keyword, result, success } of batchResults) {
          completedCount++;

          if (success && result) {
            results.push(result);
            successCount++;

            // Send success update
            await writer.write(encoder.encode(`data: ${JSON.stringify({
              type: 'keyword-complete',
              current: completedCount,
              total: cleanedKeywords.length,
              keyword: keyword,
              status: 'success'
            })}\n\n`));
          } else {
            failCount++;

            // Send failure update
            await writer.write(encoder.encode(`data: ${JSON.stringify({
              type: 'keyword-complete',
              current: completedCount,
              total: cleanedKeywords.length,
              keyword: keyword,
              status: 'failed'
            })}\n\n`));
          }
        }

        // Small delay between batches to avoid rate limiting
        if (i + MAX_WORKERS < cleanedKeywords.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }

      // Create the final data structure matching the Python output
      // We've already extracted the first element from the result array in fetchDataForSEO
      const apiData = {
        "0": Object.fromEntries(
          results.map((result, index) => [index.toString(), result])
        )
      };

      // Now analyze the data
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        type: 'analyzing',
        message: 'Processing analysis...'
      })}\n\n`));

      // Call the analyze endpoint
      const analyzeResponse = await fetch(new URL('/api/ai-analysis/analyze', request.url).toString(), {
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
        await writer.write(encoder.encode(`data: ${JSON.stringify({
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

    } catch (error) {
      console.error('Stream error:', error);
      await writer.write(encoder.encode(`data: ${JSON.stringify({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })}\n\n`));
    } finally {
      await writer.close();
    }
  })();

  // Return the stream as Server-Sent Events
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}