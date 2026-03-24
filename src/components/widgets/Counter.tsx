"use client";

import { useState } from "react";

interface CounterProps {
  initial?: number;
  step?: number;
  label?: string;
}

export default function Counter({
  initial = 0,
  step = 1,
  label = "Counter",
}: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div className="my-6 border border-border rounded-md p-5 bg-muted/30">
      <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setCount((c) => c - step)}
          className="px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
        >
          &minus;{step}
        </button>
        <span className="text-2xl font-mono font-semibold tabular-nums min-w-[3ch] text-center">
          {count}
        </span>
        <button
          type="button"
          onClick={() => setCount((c) => c + step)}
          className="px-3 py-1.5 text-sm font-medium border border-border rounded hover:bg-muted transition-colors"
        >
          +{step}
        </button>
        <button
          type="button"
          onClick={() => setCount(initial)}
          className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
