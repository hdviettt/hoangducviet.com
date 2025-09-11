"use client";

import { useState, useEffect } from "react";
import type { Tool } from "@/types/tools";

interface EmbeddedAnalysisClientProps {
  tool: Tool | null;
}

export default function EmbeddedAnalysisClient({ tool }: EmbeddedAnalysisClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Python FastAPI server URL
  const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "https://your-python-app.railway.app";
  
  useEffect(() => {
    // Check if Python server is accessible
    const checkServer = async () => {
      try {
        const response = await fetch(`${pythonApiUrl}/health`);
        if (response.ok) {
          setLoading(false);
        } else {
          setError("Python analysis server is not responding");
        }
      } catch (err) {
        setError("Failed to connect to analysis server");
      }
    };
    
    checkServer();
  }, [pythonApiUrl]);
  
  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="min-h-full p-4 md:p-8 lg:p-16 animate-fadeIn">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 md:mb-12">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground uppercase">
                {tool?.name || "AI Overviews Analysis"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-mono">
                [{tool?.description || "Analyze search engine AI overview citations and competitor mentions"}]
              </p>
            </div>
            
            <div className="border-2 border-red-500 bg-black text-red-500 px-4 py-3 font-mono text-xs uppercase">
              [Error] {error}
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p>The analysis tool is temporarily unavailable. Please try again later.</p>
              <p className="mt-2">If this persists, contact support.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="min-h-full p-4 md:p-8 lg:p-16 animate-fadeIn">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 md:mb-12">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground uppercase">
                {tool?.name || "AI Overviews Analysis"}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground font-mono">
                [Loading analysis tool...]
              </p>
            </div>
            
            <div className="border-2 border-white bg-black text-white px-4 py-3 font-mono text-xs uppercase">
              [Connecting to analysis server...]
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-hidden">
      {/* Header that stays consistent with your blog design */}
      <div className="p-4 md:p-8 lg:p-16 border-b-2 border-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-foreground uppercase">
            {tool?.name || "AI Overviews Analysis"}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-mono">
            [{tool?.description || "Analyze search engine AI overview citations and competitor mentions"}]
          </p>
        </div>
      </div>
      
      {/* Embedded Python tool */}
      <iframe
        src={pythonApiUrl}
        className="w-full h-full border-0"
        style={{ height: 'calc(100vh - 200px)' }}
        title="AI Overviews Analysis Tool"
        sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
      />
    </div>
  );
}