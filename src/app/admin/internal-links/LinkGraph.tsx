"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type GraphNode = {
  id: string;
  label: string;
  type: "post" | "project";
  incoming: number;
  // simulation state
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type GraphEdge = {
  source: string;
  target: string;
};

type Props = {
  nodes: { id: string; label: string; type: "post" | "project"; incoming: number }[];
  edges: { source: string; target: string }[];
};

const NODE_RADIUS = 6;
const COLORS = {
  post: "#3b82f6",
  project: "#a855f7",
  edge: "rgba(255,255,255,0.08)",
  edgeHover: "rgba(255,255,255,0.25)",
  label: "#a1a1aa",
  orphan: "#eab308",
};

export default function LinkGraph({ nodes: rawNodes, edges: rawEdges }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>(rawEdges);
  const hoveredRef = useRef<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const sizeRef = useRef({ w: 800, h: 500 });

  // Init nodes with positions in a circle
  useEffect(() => {
    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;

    nodesRef.current = rawNodes.map((n, i) => ({
      ...n,
      x: cx + r * Math.cos((2 * Math.PI * i) / rawNodes.length),
      y: cy + r * Math.sin((2 * Math.PI * i) / rawNodes.length),
      vx: 0,
      vy: 0,
    }));
    edgesRef.current = rawEdges;
  }, [rawNodes, rawEdges]);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    const cx = w / 2;
    const cy = h / 2;

    // Force simulation step
    for (const node of nodes) {
      // Center gravity
      node.vx += (cx - node.x) * 0.001;
      node.vy += (cy - node.y) * 0.001;

      // Repulsion from other nodes
      for (const other of nodes) {
        if (node.id === other.id) continue;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 800 / (dist * dist);
        node.vx += (dx / dist) * force;
        node.vy += (dy / dist) * force;
      }
    }

    // Edge attraction
    for (const edge of edges) {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 120) * 0.003;
      source.vx += (dx / dist) * force;
      source.vy += (dy / dist) * force;
      target.vx -= (dx / dist) * force;
      target.vy -= (dy / dist) * force;
    }

    // Apply velocity with damping
    for (const node of nodes) {
      if (dragRef.current?.id === node.id) continue;
      node.vx *= 0.85;
      node.vy *= 0.85;
      node.x += node.vx;
      node.y += node.vy;
      // Keep in bounds
      node.x = Math.max(NODE_RADIUS + 4, Math.min(w - NODE_RADIUS - 4, node.x));
      node.y = Math.max(NODE_RADIUS + 4, Math.min(h - NODE_RADIUS - 4, node.y));
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = sizeRef.current.w;
    const h = sizeRef.current.h;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const hovId = hoveredRef.current;

    // Draw edges
    for (const edge of edges) {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t) continue;

      const isHighlighted =
        hovId && (edge.source === hovId || edge.target === hovId);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = isHighlighted ? COLORS.edgeHover : COLORS.edge;
      ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
      ctx.stroke();

      // Arrow
      if (isHighlighted) {
        const angle = Math.atan2(t.y - s.y, t.x - s.x);
        const arrowDist = NODE_RADIUS + 4;
        const ax = t.x - Math.cos(angle) * arrowDist;
        const ay = t.y - Math.sin(angle) * arrowDist;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(
          ax - 6 * Math.cos(angle - 0.4),
          ay - 6 * Math.sin(angle - 0.4),
        );
        ctx.lineTo(
          ax - 6 * Math.cos(angle + 0.4),
          ay - 6 * Math.sin(angle + 0.4),
        );
        ctx.closePath();
        ctx.fillStyle = COLORS.edgeHover;
        ctx.fill();
      }
    }

    // Draw nodes
    for (const node of nodes) {
      const isHovered = hovId === node.id;
      const isOrphan = node.incoming === 0;
      const radius = isHovered ? NODE_RADIUS + 2 : NODE_RADIUS;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isOrphan
        ? COLORS.orphan
        : COLORS[node.type];
      ctx.globalAlpha = hovId && !isHovered ? 0.4 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label
      if (isHovered) {
        ctx.font = "12px var(--font-mono), monospace";
        ctx.fillStyle = COLORS.label;
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y - radius - 6);
      }
    }
  }, []);

  // Animation loop
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      simulate();
      draw();
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [simulate, draw]);

  // Resize
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        sizeRef.current.w = entry.contentRect.width;
        sizeRef.current.h = Math.max(400, entry.contentRect.width * 0.5);
      }
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Mouse interaction
  const getNodeAt = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (const node of nodesRef.current) {
      const dx = mx - node.x;
      const dy = my - node.y;
      if (dx * dx + dy * dy < (NODE_RADIUS + 4) ** 2) return node;
    }
    return null;
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragRef.current) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const node = nodesRef.current.find((n) => n.id === dragRef.current!.id);
        if (node) {
          node.x = e.clientX - rect.left - dragRef.current.offsetX;
          node.y = e.clientY - rect.top - dragRef.current.offsetY;
          node.vx = 0;
          node.vy = 0;
        }
        return;
      }
      const node = getNodeAt(e);
      const id = node?.id ?? null;
      hoveredRef.current = id;
      if (id !== hovered) setHovered(id);
    },
    [getNodeAt, hovered],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const node = getNodeAt(e);
      if (!node) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dragRef.current = {
        id: node.id,
        offsetX: e.clientX - rect.left - node.x,
        offsetY: e.clientY - rect.top - node.y,
      };
    },
    [getNodeAt],
  );

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onMouseLeave = useCallback(() => {
    hoveredRef.current = null;
    setHovered(null);
    dragRef.current = null;
  }, []);

  return (
    <div className="w-full border border-border relative">
      {/* Legend */}
      <div className="absolute top-3 left-3 flex gap-4 text-[10px] text-muted-foreground z-10">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.post }} />
          post
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.project }} />
          project
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.orphan }} />
          orphan
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ height: "clamp(400px, 50vw, 600px)" }}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
}
