"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type GraphNode = {
  id: string;
  label: string;
  type: "post" | "project";
  incoming: number;
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
  nodes: {
    id: string;
    label: string;
    type: "post" | "project";
    incoming: number;
  }[];
  edges: { source: string; target: string }[];
};

const NODE_RADIUS = 6;
const HIT_RADIUS = 14;

export default function LinkGraph({ nodes: rawNodes, edges: rawEdges }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>(rawEdges);
  const hoveredRef = useRef<string | null>(null);
  const dragRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const initedRef = useRef(false);

  // Measure container and init nodes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current.w = rect.width;
      sizeRef.current.h = Math.max(400, Math.round(rect.width * 0.5));
    };

    measure();

    // Init node positions in a circle
    if (!initedRef.current) {
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
      initedRef.current = true;
    }

    const obs = new ResizeObserver(() => measure());
    obs.observe(container);
    return () => obs.disconnect();
  }, [rawNodes, rawEdges]);

  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    if (w === 0 || h === 0) return;
    const cx = w / 2;
    const cy = h / 2;

    for (const node of nodes) {
      node.vx += (cx - node.x) * 0.001;
      node.vy += (cy - node.y) * 0.001;

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

    for (const node of nodes) {
      if (dragRef.current?.id === node.id) continue;
      node.vx *= 0.85;
      node.vy *= 0.85;
      node.x += node.vx;
      node.y += node.vy;
      node.x = Math.max(20, Math.min(w - 20, node.x));
      node.y = Math.max(20, Math.min(h - 20, node.y));
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = sizeRef.current.w;
    const h = sizeRef.current.h;
    if (w === 0 || h === 0) return;

    const dpr = window.devicePixelRatio || 1;

    // Set canvas buffer size to match CSS size * DPR
    const bufW = Math.round(w * dpr);
    const bufH = Math.round(h * dpr);
    if (canvas.width !== bufW || canvas.height !== bufH) {
      canvas.width = bufW;
      canvas.height = bufH;
    }

    // Set CSS size explicitly so getBoundingClientRect matches our coordinate space
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const hovId = hoveredRef.current;

    // Resolve M3 color tokens to concrete colors — the canvas 2D context
    // can't read CSS custom properties, so pull them off the root element.
    const rootStyle = getComputedStyle(document.documentElement);
    const token = (name: string) =>
      `hsl(${rootStyle.getPropertyValue(name).trim()})`;
    const COLORS = {
      post: token("--md-sys-color-primary"),
      project: token("--md-sys-color-tertiary"),
      edge: token("--md-sys-color-outline"),
      edgeHover: token("--md-sys-color-on-surface-variant"),
      label: token("--md-sys-color-on-surface-variant"),
      orphan: token("--md-sys-color-error"),
    };

    // Edges
    for (const edge of edges) {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t) continue;
      const isHl = hovId && (edge.source === hovId || edge.target === hovId);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = isHl ? COLORS.edgeHover : COLORS.edge;
      ctx.lineWidth = isHl ? 1.5 : 0.5;
      ctx.stroke();

      if (isHl) {
        const angle = Math.atan2(t.y - s.y, t.x - s.x);
        const ad = NODE_RADIUS + 4;
        const ax = t.x - Math.cos(angle) * ad;
        const ay = t.y - Math.sin(angle) * ad;
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

    // Nodes
    for (const node of nodes) {
      const isHov = hovId === node.id;
      const isOrphan = node.incoming === 0;
      const radius = isHov ? NODE_RADIUS + 2 : NODE_RADIUS;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isOrphan ? COLORS.orphan : COLORS[node.type];
      ctx.globalAlpha = hovId && !isHov ? 0.4 : 1;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isHov) {
        ctx.font = "12px system-ui, sans-serif";
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

  // Convert mouse event to canvas coordinates
  const toCanvasCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { mx: 0, my: 0 };
      const rect = canvas.getBoundingClientRect();
      // Scale from CSS display size to our coordinate space
      const scaleX = sizeRef.current.w / rect.width;
      const scaleY = sizeRef.current.h / rect.height;
      return {
        mx: (e.clientX - rect.left) * scaleX,
        my: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const getNodeAt = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { mx, my } = toCanvasCoords(e);
      for (const node of nodesRef.current) {
        const dx = mx - node.x;
        const dy = my - node.y;
        if (dx * dx + dy * dy < HIT_RADIUS * HIT_RADIUS) return node;
      }
      return null;
    },
    [toCanvasCoords],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { mx, my } = toCanvasCoords(e);
      if (dragRef.current) {
        const node = nodesRef.current.find(
          (n) => n.id === dragRef.current!.id,
        );
        if (node) {
          node.x = mx - dragRef.current.offsetX;
          node.y = my - dragRef.current.offsetY;
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
    [toCanvasCoords, getNodeAt, hovered],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const node = getNodeAt(e);
      if (!node) return;
      const { mx, my } = toCanvasCoords(e);
      dragRef.current = {
        id: node.id,
        offsetX: mx - node.x,
        offsetY: my - node.y,
      };
    },
    [getNodeAt, toCanvasCoords],
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
    <div ref={containerRef} className="w-full rounded-xl border border-md-outline-variant relative overflow-hidden">
      {/* Legend */}
      <div className="absolute top-3 left-3 flex gap-4 md-label-small text-md-on-surface-variant z-10">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "hsl(var(--md-sys-color-primary))" }}
          />
          post
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "hsl(var(--md-sys-color-tertiary))" }}
          />
          project
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: "hsl(var(--md-sys-color-error))" }}
          />
          orphan
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="cursor-grab active:cursor-grabbing"
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
}
