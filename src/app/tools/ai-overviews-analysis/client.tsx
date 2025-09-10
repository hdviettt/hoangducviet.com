"use client";

import { useState } from "react";
import type { Tool } from "@/types/tools";
import { AnalysisResults } from "@/lib/seo-analyzer/types";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";

type AnalysisMode = "upload" | "fetch";

interface AIOverviewsAnalysisClientProps {
  tool: Tool | null;
}

export default function AIOverviewsAnalysisClient({ tool }: AIOverviewsAnalysisClientProps) {
  const [mode, setMode] = useState<AnalysisMode>("upload");

  // Upload mode states
  const [brandName, setBrandName] = useState("");
  const [brandDomain, setBrandDomain] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Fetch mode states
  const [keywords, setKeywords] = useState("");
  const [keywordFile, setKeywordFile] = useState<File | null>(null);
  const [fastMode, setFastMode] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<{
    current: number;
    total: number;
    successful?: number;
    failed?: number;
    batch?: number;
    totalBatches?: number;
    mode?: string;
    startTime?: number;
    elapsedTime?: number;
  } | null>(null);

  // Time tracking states
  const [estimatedTime, setEstimatedTime] = useState<{
    safe: number;
    fast: number;
  } | null>(null);
  const [actualTime, setActualTime] = useState<number | null>(null);

  // Common states
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedJsonData, setFetchedJsonData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  // Sorting state for competitors table
  const [sortConfig, setSortConfig] = useState<{
    key: 'citedCount' | 'averageRank' | 'promptCitedRate' | 'mentioned';
    direction: 'asc' | 'desc';
  }>({ key: 'citedCount', direction: 'desc' });

  // Fixed exchange rate
  const EXCHANGE_RATE = 26000; // 1 USD = 26,000 VND

  // Calculate cost estimation
  const calculateCost = (keywordCount: number) => {
    const costPerKeyword = 0.004; // $0.004 per keyword
    const totalUSD = keywordCount * costPerKeyword;
    const totalVND = totalUSD * EXCHANGE_RATE;

    return {
      usd: totalUSD,
      vnd: totalVND,
      formattedUSD: `$${totalUSD.toFixed(2)}`,
      formattedVND: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(totalVND)
    };
  };

  // Get keyword count from textarea or file
  const getKeywordCount = () => {
    const keywordText = keywords.trim();
    if (!keywordText) return 0;
    return keywordText.split(/\r?\n/).filter(line => line.trim().length > 0).length;
  };

  // Calculate estimated processing time
  const calculateEstimatedTime = (keywordCount: number) => {
    // Based on DataForSEO API performance patterns:
    // Average API response time: ~1.2-2.5 seconds per keyword
    // Network latency: ~0.1-0.3 seconds per request

    const avgApiResponseTime = 1.8; // seconds per keyword
    const networkLatency = 0.2; // seconds per request

    // Safe Mode: 16 workers, 200ms delays between batches
    const safeWorkers = 16;
    const safeBatchDelay = 0.2; // 200ms
    const safeBatches = Math.ceil(keywordCount / safeWorkers);
    const safeProcessingTime = Math.ceil(keywordCount / safeWorkers) * (avgApiResponseTime + networkLatency);
    const safeBatchDelays = (safeBatches - 1) * safeBatchDelay;
    const safeTotal = safeProcessingTime + safeBatchDelays;

    // Fast Mode: All keywords simultaneously (limited by API response time)
    // Assumes unlimited concurrency, bottlenecked by slowest API call
    const fastProcessingTime = avgApiResponseTime + networkLatency; // All requests in parallel
    const fastTotal = fastProcessingTime + 0.5; // Add small buffer for processing

    return {
      safe: Math.max(safeTotal, keywordCount * 0.5), // Minimum 0.5s per keyword
      fast: Math.max(fastTotal, 2.5) // Minimum 2.5 seconds total
    };
  };

  // Format time in human readable format
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  };

  const handleKeywordFileUpload = async (file: File) => {
    try {
      const text = await file.text();
      // Handle both CSV and plain text files
      const lines = text.split(/\r?\n/);
      const keywordList = lines
        .map(line => line.trim())
        .filter(line => line.length > 0);

      setKeywords(keywordList.join("\n"));
      setKeywordFile(file);

      // Calculate time estimates for the new keyword list
      const estimates = calculateEstimatedTime(keywordList.length);
      setEstimatedTime(estimates);
    } catch (err) {
      setError("Failed to read keyword file");
    }
  };

  const handleFetchAndAnalyze = async () => {
    if (!brandName || !brandDomain || !keywords.trim()) {
      setError("Please fill all fields");
      return;
    }

    // Check if password is required for fetch mode
    if (tool?.password && tool.password.trim() !== "") {
      setShowPasswordPrompt(true);
      return;
    }

    // Proceed with analysis
    startAnalysis();
  };

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setError(null);
    setVerifyingPassword(true);
    
    try {
      // Verify password with API
      const response = await fetch("/api/tools/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolSlug: tool?.slug,
          password: password
        })
      });

      const data = await response.json();

      console.log("Password verification response:", { status: response.status, data });

      if (!response.ok) {
        console.error("API error:", data);
        setError(data.error || "Password verification failed");
        return;
      }

      if (!data.valid) {
        console.log("Password validation failed");
        setError("Incorrect password");
        return;
      }

      // Password is correct, close prompt and start analysis
      setShowPasswordPrompt(false);
      setError(null);
      startAnalysis();
      
    } catch (error) {
      console.error("Password verification error:", error);
      setError("Password verification failed");
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordPrompt(false);
    setPassword("");
    setError(null);
  };

  const startAnalysis = async () => {
    setLoading(true);
    setError(null);
    setActualTime(null); // Reset previous time

    const startTime = Date.now();
    setFetchProgress({ current: 0, total: 0, startTime });

    try {
      // Parse keywords
      const keywordList = keywords
        .split(/\r?\n/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (keywordList.length === 0) {
        throw new Error("No valid keywords provided");
      }

      // Use EventSource for Server-Sent Events
      const response = await fetch("/api/ai-analysis/fetch-keywords-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: keywordList,
          brandName,
          brandDomain,
          locationCode: 2704,
          languageCode: "vi",
          fastMode: fastMode
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start keyword fetching: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to read response stream");
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'start':
                  setFetchProgress({
                    current: 0,
                    total: data.total,
                    mode: data.mode,
                    successful: 0,
                    failed: 0,
                    startTime: Date.now()
                  });
                  break;

                case 'progress':
                  const now = Date.now();
                  const elapsedTime = fetchProgress?.startTime ? (now - fetchProgress.startTime) / 1000 : 0;

                  setFetchProgress({
                    current: data.current,
                    total: data.total,
                    successful: data.successful || 0,
                    failed: data.failed || 0,
                    batch: data.batch,
                    totalBatches: data.totalBatches,
                    mode: fetchProgress?.mode || 'safe',
                    startTime: fetchProgress?.startTime || now,
                    elapsedTime
                  });
                  break;

                case 'analyzing':
                  setFetchProgress(null);
                  break;

                case 'complete':
                  // Calculate final processing time
                  const finalTime = fetchProgress?.startTime ? (Date.now() - fetchProgress.startTime) / 1000 : 0;
                  setActualTime(finalTime);

                  setResults(data.results);
                  if (data.rawData) {
                    setFetchedJsonData(data.rawData);
                    // Automatically download the JSON file
                    const jsonBlob = new Blob([JSON.stringify(data.rawData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(jsonBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dataforseo_results_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                  if (data.stats) {
                    console.log(`Completed: ${data.stats.successful}/${data.stats.requested} keywords in ${formatTime(finalTime)}`);
                  }
                  setLoading(false);
                  setFetchProgress(null);
                  break;

                case 'error':
                  throw new Error(data.message);
              }
            } catch (e) {
              console.error('Failed to parse SSE message:', e);
            }
          }
        }
      }

    } catch (err) {
      console.error("Error in handleFetchAndAnalyze:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setLoading(false);
      setFetchProgress(null);
    }
  };

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !brandName || !brandDomain) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch("/api/ai-analysis/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          brandDomain,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setResults(result.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Sort competitors based on current sort configuration
  const getSortedCompetitors = () => {
    if (!results?.competitors) return [];

    const sorted = [...results.competitors].sort((a, b) => {
      let aValue: number = 0;
      let bValue: number = 0;

      switch (sortConfig.key) {
        case 'citedCount':
          aValue = a.citedCount;
          bValue = b.citedCount;
          break;
        case 'averageRank':
          aValue = a.averageRank;
          bValue = b.averageRank;
          break;
        case 'promptCitedRate':
          aValue = a.promptCitedRate;
          bValue = b.promptCitedRate;
          break;
        case 'mentioned':
          const aMention = results.brandMentions.find(bm => bm.competitor === a.brand);
          const bMention = results.brandMentions.find(bm => bm.competitor === b.brand);
          aValue = aMention?.mentioned || 0;
          bValue = bMention?.mentioned || 0;
          break;
      }

      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return sorted;
  };

  // Get competitors for display (top 10 + user's brand if not in top 10)
  const getDisplayCompetitors = () => {
    const sorted = getSortedCompetitors();
    const top10 = sorted.slice(0, 10);

    // Check if user's brand is in top 10
    const userBrandInTop10 = top10.some(c => isUserBrand(c.brand));

    if (!userBrandInTop10) {
      // Find user's brand in the full list
      const userBrandCompetitor = sorted.find(c => isUserBrand(c.brand));
      if (userBrandCompetitor) {
        // Add user's brand at the end with its rank
        const userBrandRank = sorted.findIndex(c => isUserBrand(c.brand)) + 1;
        return [...top10, { ...userBrandCompetitor, displayRank: userBrandRank }];
      }
    }

    return top10;
  };

  // Handle sort column click
  const handleSort = (key: 'citedCount' | 'averageRank' | 'promptCitedRate' | 'mentioned') => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Check if a competitor matches the user's input brand
  const isUserBrand = (competitor: any) => {
    if (!brandName && !brandDomain) return false;

    // Handle both string input (for chart data) and competitor object (for table)
    const competitorBrand = typeof competitor === 'string' ? competitor : competitor.brand;
    const competitorDomains = typeof competitor === 'object' ? competitor.uniqueDomains || [] : [];

    const normalizedCompetitor = competitorBrand.toLowerCase().trim();

    // Check against brand name
    if (brandName) {
      const normalizedBrand = brandName.toLowerCase().trim();
      if (normalizedCompetitor.includes(normalizedBrand) || normalizedBrand.includes(normalizedCompetitor)) {
        return true;
      }
    }

    // Check against brand domain
    if (brandDomain) {
      const normalizedDomain = brandDomain.toLowerCase().trim();

      // Check if competitor brand matches domain
      if (normalizedCompetitor.includes(normalizedDomain) || normalizedDomain.includes(normalizedCompetitor)) {
        return true;
      }

      // Check if any of competitor's domains match user's domain
      for (const domain of competitorDomains) {
        if (domain.toLowerCase().includes(normalizedDomain) || normalizedDomain.includes(domain.toLowerCase())) {
          return true;
        }
      }

      // Also check domain core (without extensions)
      const domainCore = normalizedDomain
        .replace(/^(https?:\/\/)?(www\.)?/, '') // Remove protocol and www
        .replace(/\.[^.]+$/, '') // Remove top-level domain
        .trim();

      if (domainCore && (normalizedCompetitor.includes(domainCore) || domainCore.includes(normalizedCompetitor))) {
        return true;
      }
    }

    return false;
  };

  // Prepare data for funnel/metrics display
  const getKeywordMetrics = () => {
    if (!results) return {
      total: 0,
      withAIO: 0,
      withBrand: 0,
      aioRate: 0,
      brandRate: 0,
      brandInAIORate: 0
    };

    const totalKeywords = results.keywords.length;
    const withAIO = results.keywords.filter(k => k.hasAIOverview).length;
    const withBrandCitation = results.keywords.filter(k => k.hasAIOverview && k.brandRank).length;

    return {
      total: totalKeywords,
      withAIO: withAIO,
      withBrand: withBrandCitation,
      aioRate: totalKeywords > 0 ? (withAIO / totalKeywords * 100) : 0,
      brandRate: totalKeywords > 0 ? (withBrandCitation / totalKeywords * 100) : 0,
      brandInAIORate: withAIO > 0 ? (withBrandCitation / withAIO * 100) : 0
    };
  };

  // Prepare data for citations bar chart
  const getCitationsChartData = () => {
    if (!results) return [];

    return getSortedCompetitors()
      .slice(0, 10)
      .map(comp => ({
        name: comp.brand.length > 15 ? comp.brand.substring(0, 15) + '...' : comp.brand,
        fullName: comp.brand,
        citations: comp.citedCount,
        isUserBrand: isUserBrand(comp) // Pass full competitor object
      }));
  };

  // Prepare data for mentions bar chart
  const getMentionsChartData = () => {
    if (!results) return [];

    const mentionsData = results.brandMentions
      .sort((a, b) => b.mentioned - a.mentioned)
      .slice(0, 10)
      .map(bm => {
        // Find the full competitor object to get domains
        const competitor = results.competitors.find(c => c.brand === bm.competitor);
        return {
          name: bm.competitor.length > 15 ? bm.competitor.substring(0, 15) + '...' : bm.competitor,
          fullName: bm.competitor,
          mentions: bm.mentioned,
          isUserBrand: competitor ? isUserBrand(competitor) : isUserBrand(bm.competitor)
        };
      });

    return mentionsData;
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]): string => {
    if (!data.length) return "";
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "object" ? JSON.stringify(value) : value;
        })
        .join(","),
    );
    return [headers.join(","), ...rows].join("\n");
  };

  // Tool metadata with fallback values
  const toolName = tool?.name || "AI Overviews Analysis";
  const toolDescription = tool?.description || "Analyze search engine AI overview citations and competitor mentions";

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full p-4 md:p-8 lg:p-16 animate-fadeIn">
        <div className="max-w-7xl mx-auto">
          {/* Header with dynamic tool metadata */}
          <div className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground uppercase">
              {toolName}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-mono">
              [{toolDescription}]
            </p>
          </div>

          {/* Mode Selector */}
          <div className="border-2 border-white bg-black mb-8">
            <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold">
              Select Mode
            </div>
            <div className="p-4 flex gap-4">
              <button
                onClick={() => setMode("fetch")}
                className={`px-4 py-2 border-2 border-white font-mono text-xs uppercase transition-colors ${mode === "fetch"
                  ? "bg-white text-black"
                  : "bg-black text-white hover:bg-white hover:text-black"
                  }`}
              >
                [Fetch Keywords]
              </button>
              <button
                onClick={() => setMode("upload")}
                className={`px-4 py-2 border-2 border-white font-mono text-xs uppercase transition-colors ${mode === "upload"
                  ? "bg-white text-black"
                  : "bg-black text-white hover:bg-white hover:text-black"
                  }`}
              >
                [Upload JSON]
              </button>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="border-2 border-white bg-black mb-8">
            <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold">
              {mode === "fetch" ? "Fetch & Analyze" : "Upload & Analyze"}
            </div>

            <form onSubmit={mode === "upload" ? handleUploadAndAnalyze : (e) => { e.preventDefault(); handleFetchAndAnalyze(); }} className="p-4 md:p-6 space-y-6">
              {/* Brand Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-mono uppercase text-white mb-2">
                    [Brand Name]
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 bg-black text-white border-2 border-white focus:outline-none focus:bg-white focus:text-black transition-colors font-mono text-sm uppercase placeholder-gray-500"
                    placeholder="e.g., TECHCOMBANK"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-white mb-2">
                    [Brand Domain]
                  </label>
                  <input
                    type="text"
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-black text-white border-2 border-white focus:outline-none focus:bg-white focus:text-black transition-colors font-mono text-sm placeholder-gray-500"
                    placeholder="e.g., techcombank.com.vn"
                  />
                </div>
              </div>


              {/* Mode-specific inputs */}
              {mode === "fetch" ? (
                <>
                  <div>
                    <label className="block text-xs font-mono uppercase text-white mb-2">
                      [Keywords] - One per line or upload CSV
                    </label>
                    <div className="space-y-3">
                      <textarea
                        value={keywords}
                        onChange={(e) => {
                          setKeywords(e.target.value);
                          // Calculate time estimates on keyword change
                          const keywordCount = e.target.value.trim()
                            ? e.target.value.split(/\r?\n/).filter(line => line.trim().length > 0).length
                            : 0;
                          if (keywordCount > 0) {
                            const estimates = calculateEstimatedTime(keywordCount);
                            setEstimatedTime(estimates);
                          } else {
                            setEstimatedTime(null);
                          }
                        }}
                        className="w-full px-3 py-2 bg-black text-white border-2 border-white focus:outline-none focus:bg-white focus:text-black transition-colors font-mono text-sm placeholder-gray-500 h-32 resize-none"
                        placeholder="Enter keywords, one per line..."
                      />
                      <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <input
                            type="file"
                            accept=".csv,.txt"
                            id="keyword-file-input"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleKeywordFileUpload(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-full px-3 py-2 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors font-mono text-xs cursor-pointer">
                            <span className="inline-block mr-4 py-1 px-4 border-2 border-white uppercase">
                              [Upload CSV/TXT]
                            </span>
                            <span className="text-gray-400">
                              {keywordFile ? keywordFile.name : "No file selected"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {keywords && (
                        <div className="space-y-1">
                          <div className="text-xs font-mono text-muted-foreground">
                            [{keywords.split(/\r?\n/).filter(k => k.trim()).length} keywords]
                          </div>
                          <div className="border-2 border-white p-3 bg-black">
                            <div className="text-xs font-mono uppercase text-white mb-2">
                              [Cost Estimation]
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                              <div>
                                <span className="text-gray-400">USD: </span>
                                <span className="text-white font-bold">
                                  {calculateCost(getKeywordCount()).formattedUSD}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">VND: </span>
                                <span className="text-white font-bold">
                                  {calculateCost(getKeywordCount()).formattedVND}
                                </span>
                              </div>
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 mt-2">
                              Rate: 1 USD = 26,000 VND
                            </div>
                            {getKeywordCount() > 200 && (
                              <div className="text-[10px] font-mono text-yellow-400 mt-2 border border-yellow-400/30 p-2">
                                Large keyword sets may take several minutes to process. Processing will continue in batches.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fast Mode Toggle */}
                  <div className="border-2 border-white p-3 bg-black">
                    <div className="text-xs font-mono uppercase text-white mb-3">
                      [Processing Mode]
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono uppercase transition-colors ${!fastMode ? 'text-white font-bold' : 'text-gray-400'
                          }`}>
                          Safe Mode
                        </span>

                        {/* Toggle Switch */}
                        <div
                          onClick={() => setFastMode(!fastMode)}
                          className="relative w-12 h-6 border-2 border-white bg-black cursor-pointer transition-all"
                        >
                          <div
                            className={`absolute top-0 w-4 h-4 bg-white transition-transform ${fastMode ? 'translate-x-6' : 'translate-x-0'
                              }`}
                          />
                        </div>

                        <span className={`text-xs font-mono uppercase transition-colors ${fastMode ? 'text-white font-bold' : 'text-gray-400'
                          }`}>
                          Fast Mode
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-gray-400 mt-3">
                      {fastMode
                        ? "no delays - maximum speed"
                        : "stable processing for all platforms"
                      }
                    </div>

                    {/* Time Estimates */}
                    {estimatedTime && getKeywordCount() > 0 && (
                      <div className="mt-4 p-3 border border-white/30">
                        <div className="text-xs font-mono uppercase text-white mb-2">
                          [Estimated Processing Time]
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                          <div className={`${!fastMode ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                            Safe Mode: {formatTime(estimatedTime.safe)}
                          </div>
                          <div className={`${fastMode ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
                            Fast Mode: {formatTime(estimatedTime.fast)}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-yellow-400 mt-2">
                          Fast mode is ~{Math.round(estimatedTime.safe / estimatedTime.fast)}x faster for {getKeywordCount()} keywords
                        </div>
                      </div>
                    )}
                  </div>

                  {fetchProgress && loading && (
                    <div className="border-2 border-white p-4">
                      <div className="text-xs font-mono uppercase text-white mb-3">
                        [Fetching Keywords - {fetchProgress.mode?.toUpperCase()} MODE]
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="w-full bg-black border border-white h-8 relative">
                          <div
                            className="absolute inset-0 bg-white transition-all duration-300"
                            style={{
                              width: fetchProgress.total > 0
                                ? `${(fetchProgress.current / fetchProgress.total) * 100}%`
                                : '0%'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-mono text-black mix-blend-difference font-bold">
                              {fetchProgress.current} / {fetchProgress.total}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Stats */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <span className="text-green-400">✓ Successful: </span>
                          <span className="text-white font-bold">{fetchProgress.successful || 0}</span>
                        </div>
                        <div>
                          <span className="text-red-400">✗ Failed: </span>
                          <span className="text-white font-bold">{fetchProgress.failed || 0}</span>
                        </div>
                      </div>

                      {/* Batch Info (Safe Mode Only) */}
                      {fetchProgress.batch && fetchProgress.totalBatches && (
                        <div className="text-xs font-mono text-muted-foreground mt-2">
                          Batch {fetchProgress.batch} of {fetchProgress.totalBatches}
                        </div>
                      )}

                      {/* Time Tracking */}
                      {fetchProgress.elapsedTime && (
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-3 pt-3 border-t border-white/20">
                          <div>
                            <span className="text-blue-400">Elapsed: </span>
                            <span className="text-white font-bold">{formatTime(fetchProgress.elapsedTime)}</span>
                          </div>
                          <div>
                            <span className="text-purple-400">Speed: </span>
                            <span className="text-white font-bold">
                              {(fetchProgress.current / fetchProgress.elapsedTime).toFixed(1)} kw/s
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-xs font-mono text-muted-foreground mt-2">
                        {fetchProgress.mode === 'fast'
                          ? `Processing all keywords simultaneously...`
                          : `Processing in batches of 16...`}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-xs font-mono uppercase text-white mb-2">
                    [DataForSEO JSON File]
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      id="json-file-input"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-3 py-2 bg-black text-white border-2 border-white hover:bg-white hover:text-black transition-colors font-mono text-xs cursor-pointer">
                      <span className="inline-block mr-4 py-1 px-4 border-2 border-white uppercase">
                        [Choose File]
                      </span>
                      <span className="text-gray-400">
                        {file ? file.name : "No file selected"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-black border-2 border-red-500 text-red-500 px-4 py-3 font-mono text-xs uppercase">
                  [Error] {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white border-2 border-white py-3 px-4 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-xs uppercase font-bold"
              >
                {loading
                  ? "[Processing...]"
                  : mode === "fetch"
                    ? "[Fetch & Analyze]"
                    : "[Analyze Data]"
                }
              </button>
            </form>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-8">
              {/* Processing Time Summary */}
              {actualTime && estimatedTime && (
                <div className="border-2 border-white bg-black">
                  <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold">
                    Processing Time Results
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center border-2 border-white p-4">
                        <div className="text-2xl md:text-3xl font-bold text-green-400 font-mono">
                          {formatTime(actualTime)}
                        </div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">
                          [Actual Time]
                        </div>
                      </div>
                      <div className="text-center border-2 border-white p-4">
                        <div className="text-2xl md:text-3xl font-bold text-blue-400 font-mono">
                          {formatTime(fastMode ? estimatedTime.fast : estimatedTime.safe)}
                        </div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">
                          [Estimated Time]
                        </div>
                      </div>
                      <div className="text-center border-2 border-white p-4">
                        <div className="text-2xl md:text-3xl font-bold text-purple-400 font-mono">
                          {((results.keywords.length / actualTime).toFixed(1))} kw/s
                        </div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">
                          [Processing Speed]
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-3 border border-white/30">
                      <div className="text-xs font-mono text-yellow-400">
                        📊 Mode Comparison: {fastMode ? 'Fast' : 'Safe'} mode was{' '}
                        {actualTime < (fastMode ? estimatedTime.fast : estimatedTime.safe) ? 'faster' : 'slower'} than estimated by{' '}
                        {Math.abs(actualTime - (fastMode ? estimatedTime.fast : estimatedTime.safe)).toFixed(1)}s
                      </div>
                      <div className="text-[10px] font-mono text-gray-400 mt-1">
                        {fastMode
                          ? `Fast mode would have taken ~${formatTime(estimatedTime.safe)} in Safe mode (${(estimatedTime.safe / actualTime).toFixed(1)}x slower)`
                          : `Fast mode would take ~${formatTime(estimatedTime.fast)} (${(actualTime / estimatedTime.fast).toFixed(1)}x faster)`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Summary */}
              <div className="border-2 border-white bg-black">
                <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold">
                  Analysis Summary
                </div>
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center border-2 border-white p-4">
                      <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                        {results.keywords.length}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">
                        [Total Keywords]
                      </div>
                    </div>
                    <div className="text-center border-2 border-white p-4">
                      <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                        {results.aiOverviews.length}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">
                        [AI Overviews]
                      </div>
                    </div>
                    <div className="text-center border-2 border-white p-4">
                      <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                        {results.competitors.length}
                      </div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">
                        [Competitors]
                      </div>
                    </div>
                    <div className="text-center border-2 border-white p-4">
                      <div className="text-2xl md:text-3xl font-bold text-white font-mono">
                        {
                          results.brandMentions.filter((b) => b.mentioned > 0)
                            .length
                        }
                      </div>
                      <div className="text-[10px] font-mono uppercase text-muted-foreground mt-2">
                        [Brand Mentions]
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="space-y-6 mb-8">
                {/* Keywords Funnel - Visual Cascade */}
                <div className="border-2 border-white bg-black p-6">
                  <div className="text-xs font-mono uppercase text-white mb-6 text-center">
                    [Keywords Performance Funnel]
                  </div>

                  {/* Funnel Visualization */}
                  <div className="max-w-2xl mx-auto space-y-4">
                    {/* Total Keywords */}
                    <div className="relative">
                      <div className="bg-gray-800 border-2 border-white p-4 text-center">
                        <div className="text-2xl font-mono font-bold text-white">{getKeywordMetrics().total}</div>
                        <div className="text-xs font-mono uppercase text-gray-400 mt-1">Total Keywords Analyzed</div>
                      </div>
                    </div>

                    {/* Arrow Down */}
                    <div className="flex justify-center">
                      <div className="text-white text-2xl">↓</div>
                    </div>

                    {/* AI Overview Keywords */}
                    <div className="relative mx-auto" style={{ width: '85%' }}>
                      <div className="bg-yellow-900/50 border-2 border-yellow-400 p-4 text-center relative">
                        <div className="text-2xl font-mono font-bold text-yellow-400">{getKeywordMetrics().withAIO}</div>
                        <div className="text-xs font-mono uppercase text-yellow-400/80 mt-1">
                          Keywords with AI Overview
                        </div>
                        <div className="text-[10px] font-mono text-yellow-400/60 mt-2">
                          {getKeywordMetrics().aioRate.toFixed(1)}% of total
                        </div>
                        {/* Side indicator */}
                        <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500">
                          -{getKeywordMetrics().total - getKeywordMetrics().withAIO} lost
                        </div>
                      </div>
                    </div>

                    {/* Arrow Down */}
                    <div className="flex justify-center">
                      <div className="text-white text-2xl">↓</div>
                    </div>

                    {/* Brand Cited Keywords */}
                    <div className="relative mx-auto" style={{ width: '60%' }}>
                      <div className="bg-green-900/50 border-2 border-green-400 p-4 text-center relative">
                        <div className="text-2xl font-mono font-bold text-green-400">{getKeywordMetrics().withBrand}</div>
                        <div className="text-xs font-mono uppercase text-green-400/80 mt-1">
                          Keywords with Brand Cited
                        </div>
                        <div className="text-[10px] font-mono text-green-400/60 mt-2">
                          {getKeywordMetrics().brandInAIORate.toFixed(1)}% of AI Overviews | {getKeywordMetrics().brandRate.toFixed(1)}% of total
                        </div>
                        {/* Side indicator */}
                        <div className="absolute -right-20 top-1/2 -translate-y-1/2 text-xs font-mono text-gray-500">
                          -{getKeywordMetrics().withAIO - getKeywordMetrics().withBrand} lost
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Summary */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t-2 border-white/20">
                    <div className="text-center">
                      <div className="text-xl font-mono font-bold text-yellow-400">
                        {getKeywordMetrics().aioRate.toFixed(1)}%
                      </div>
                      <div className="text-[10px] font-mono uppercase text-gray-400 mt-1">
                        AI Overview<br />Activation Rate
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-mono font-bold text-green-400">
                        {getKeywordMetrics().brandInAIORate.toFixed(1)}%
                      </div>
                      <div className="text-[10px] font-mono uppercase text-gray-400 mt-1">
                        Brand Citation<br />in AI Overviews
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-mono font-bold text-white">
                        {getKeywordMetrics().brandRate.toFixed(1)}%
                      </div>
                      <div className="text-[10px] font-mono uppercase text-gray-400 mt-1">
                        Overall Brand<br />Coverage
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bar Charts Grid - 2 columns on desktop, 1 on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart - Top Cited Brands */}
                  <div className="border-2 border-white bg-black p-4">
                    <div className="text-xs font-mono uppercase text-white mb-4 text-center">
                      [Top Cited Brands]
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={getCitationsChartData()} margin={{ top: 5, right: 5, left: 5, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: 'white', fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis tick={{ fill: 'white', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'black',
                            border: '2px solid white',
                            borderRadius: 0
                          }}
                          labelStyle={{ color: 'white', fontFamily: 'monospace', fontSize: '12px' }}
                          formatter={(value, name) => [value, 'Citations']}
                          labelFormatter={(label) => {
                            const item = getCitationsChartData().find(d => d.name === label);
                            return item?.fullName || label;
                          }}
                        />
                        <Bar dataKey="citations">
                          {getCitationsChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isUserBrand ? '#10B981' : '#6B7280'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar Chart - Top Mentioned Brands */}
                  <div className="border-2 border-white bg-black p-4">
                    <div className="text-xs font-mono uppercase text-white mb-4 text-center">
                      [Top Mentioned Brands]
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={getMentionsChartData()} margin={{ top: 5, right: 5, left: 5, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: 'white', fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis tick={{ fill: 'white', fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'black',
                            border: '2px solid white',
                            borderRadius: 0
                          }}
                          labelStyle={{ color: 'white', fontFamily: 'monospace', fontSize: '12px' }}
                          formatter={(value, name) => [value, 'Mentions']}
                          labelFormatter={(label) => {
                            const item = getMentionsChartData().find(d => d.name === label);
                            return item?.fullName || label;
                          }}
                        />
                        <Bar dataKey="mentions">
                          {getMentionsChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isUserBrand ? '#10B981' : '#6B7280'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Keywords Preview */}
              <div className="border-2 border-white bg-black">
                <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold flex justify-between items-center">
                  <span>Keywords Analysis [{results.keywords.length} total]</span>
                  <div className="flex gap-2">
                    {fetchedJsonData && (
                      <button
                        onClick={() => {
                          const jsonBlob = new Blob([JSON.stringify(fetchedJsonData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(jsonBlob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `dataforseo_results_${new Date().toISOString().split('T')[0]}.json`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1 border border-white text-[10px] hover:bg-white hover:text-black transition-colors"
                      >
                        [Download JSON]
                      </button>
                    )}
                    <button
                      onClick={() =>
                        downloadCSV(results.keywords, "keywords.csv")
                      }
                      className="px-3 py-1 border border-white text-[10px] hover:bg-white hover:text-black transition-colors"
                    >
                      [Download CSV]
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-white">
                        <th className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white">
                          [Keyword]
                        </th>
                        <th className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white">
                          [Has AI Overview]
                        </th>
                        <th className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white">
                          [References]
                        </th>
                        <th className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white">
                          [Brand Rank]
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.keywords.slice(0, 15).map((keyword, idx) => (
                        <tr key={idx} className="border-b border-white/20 hover:bg-white hover:text-black transition-colors">
                          <td className="px-4 py-3 text-xs font-mono">
                            {keyword.keyword}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono">
                            {keyword.hasAIOverview ? "YES" : "NO"}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono">
                            {keyword.referenceCount || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono">
                            {keyword.brandRank ? `#${keyword.brandRank}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {results.keywords.length > 15 && (
                    <div className="px-4 py-3 text-[10px] font-mono text-muted-foreground uppercase">
                      [Showing 15 of {results.keywords.length} keywords]
                    </div>
                  )}
                </div>
              </div>

              {/* Top Competitors */}
              <div className="border-2 border-white bg-black">
                <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold flex justify-between items-center">
                  <span>Top Competitors</span>
                  <button
                    onClick={() =>
                      downloadCSV(results.competitors, "competitors.csv")
                    }
                    className="px-3 py-1 border border-white text-[10px] hover:bg-white hover:text-black transition-colors"
                  >
                    [Download CSV]
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-white">
                        <th className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white">
                          [#]
                        </th>
                        <th className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white">
                          [Brand]
                        </th>
                        <th className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white">
                          [Domains]
                        </th>
                        <th
                          className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white cursor-pointer hover:bg-white hover:text-black"
                          onClick={() => handleSort('citedCount')}
                        >
                          [Citations] {sortConfig.key === 'citedCount' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th
                          className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white cursor-pointer hover:bg-white hover:text-black"
                          onClick={() => handleSort('averageRank')}
                        >
                          [Avg Rank] {sortConfig.key === 'averageRank' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th
                          className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white cursor-pointer hover:bg-white hover:text-black"
                          onClick={() => handleSort('promptCitedRate')}
                        >
                          [Citation Rate] {sortConfig.key === 'promptCitedRate' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                        <th
                          className="px-4 py-2 text-left text-[10px] font-mono uppercase text-white cursor-pointer hover:bg-white hover:text-black"
                          onClick={() => handleSort('mentioned')}
                        >
                          [Mentions] {sortConfig.key === 'mentioned' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDisplayCompetitors().map((competitor, idx) => {
                        const brandMention = results.brandMentions.find(
                          bm => bm.competitor === competitor.brand
                        );
                        const isHighlighted = isUserBrand(competitor); // Pass full competitor object
                        const displayRank = (competitor as any).displayRank;
                        const isAppended = displayRank && displayRank > 10;

                        return (
                          <>
                            {isAppended && idx === 10 && (
                              <tr key="separator" className="border-t-2 border-white">
                                <td colSpan={7} className="px-4 py-1 text-[10px] font-mono text-center text-gray-400">
                                  [... {displayRank - 11} more competitors ...]
                                </td>
                              </tr>
                            )}
                            <tr
                              key={idx}
                              className={`border-b border-white/20 hover:bg-white hover:text-black transition-colors ${isHighlighted ? 'bg-green-900/30 font-bold' : ''
                                }`}
                            >
                              <td className="px-4 py-3 text-xs font-mono text-gray-400">
                                #{displayRank || idx + 1}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                {competitor.brand}
                                {isHighlighted && <span className="ml-2 text-green-400">[YOUR BRAND]</span>}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono" title={competitor.uniqueDomains.join(", ")}>
                                {competitor.uniqueDomains.length > 2
                                  ? `${competitor.uniqueDomains.slice(0, 2).join(", ")}...`
                                  : competitor.uniqueDomains.join(", ")
                                }
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                {competitor.citedCount}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                {competitor.averageRank.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                {(competitor.promptCitedRate * 100).toFixed(1)}%
                              </td>
                              <td className="px-4 py-3 text-xs font-mono">
                                {brandMention ? brandMention.mentioned : 0}
                              </td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export Data */}
              <div className="border-2 border-white bg-black">
                <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold">
                  Export Data
                </div>
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() =>
                        downloadCSV(results.keywords, "keywords.csv")
                      }
                      className="bg-black text-white border-2 border-white px-4 py-3 hover:bg-white hover:text-black transition-colors font-mono text-xs uppercase"
                    >
                      [Download Keywords CSV]
                    </button>
                    <button
                      onClick={() =>
                        downloadCSV(results.competitors, "competitors.csv")
                      }
                      className="bg-black text-white border-2 border-white px-4 py-3 hover:bg-white hover:text-black transition-colors font-mono text-xs uppercase"
                    >
                      [Download Competitors CSV]
                    </button>
                    <button
                      onClick={() =>
                        downloadCSV(results.brandMentions, "brand_mentions.csv")
                      }
                      className="bg-black text-white border-2 border-white px-4 py-3 hover:bg-white hover:text-black transition-colors font-mono text-xs uppercase"
                    >
                      [Download Brand Mentions CSV]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Prompt Modal */}
          {showPasswordPrompt && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="border-2 border-white bg-black p-6 max-w-md w-full mx-4">
                <div className="bg-black text-white font-mono text-xs px-2 py-2 border-b-2 border-white uppercase font-bold mb-4">
                  Authentication Required
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-white mb-2">
                      [Tool Password] <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                      className="w-full px-3 py-2 bg-black text-white border-2 border-white focus:outline-none focus:bg-white focus:text-black transition-colors font-mono text-sm placeholder-gray-500"
                      placeholder="Enter password to access fetch mode"
                      autoFocus
                    />
                    <div className="text-[10px] font-mono text-yellow-400 mt-1">
                      🔒 Password required for keyword fetching mode
                    </div>
                  </div>

                  {error && (
                    <div className="bg-black border-2 border-red-500 text-red-500 px-3 py-2 font-mono text-xs uppercase">
                      [Error] {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handlePasswordSubmit}
                      disabled={verifyingPassword}
                      className="flex-1 bg-black text-white border-2 border-white py-2 px-4 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-mono text-xs uppercase font-bold"
                    >
                      {verifyingPassword ? "[Verifying...]" : "[Authenticate]"}
                    </button>
                    <button
                      onClick={handlePasswordCancel}
                      className="flex-1 bg-black text-gray-400 border-2 border-gray-400 py-2 px-4 hover:bg-gray-400 hover:text-black transition-colors font-mono text-xs uppercase"
                    >
                      [Cancel]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}