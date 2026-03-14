"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";

// ---- Tier Definitions ----

const STREAK_TIERS = [
  { min: 5, label: "", particles: 2, shake: 0 },
  { min: 15, label: "Nice!", particles: 3, shake: 0 },
  { min: 30, label: "Great!", particles: 5, shake: 0.5 },
  { min: 60, label: "On Fire!", particles: 7, shake: 1 },
  { min: 120, label: "UNSTOPPABLE!", particles: 10, shake: 1.5 },
];

// Orange-themed particle colors that escalate
const PARTICLE_COLORS = [
  ["#fb923c", "#fdba74", "#fed7aa"], // light orange (5+)
  ["#f97316", "#fb923c", "#fdba74"], // orange (15+)
  ["#ea580c", "#f97316", "#fb923c"], // deep orange (30+)
  ["#dc2626", "#f97316", "#fbbf24", "#fb923c"], // orange + red + yellow (60+)
  ["#dc2626", "#f97316", "#fbbf24", "#ffffff", "#fb923c"], // full fire (120+)
];

function getTier(streak: number) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].min) return { tier: STREAK_TIERS[i], index: i };
  }
  return null;
}

// ---- Particle Interface ----

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

// ---- Component ----

interface StreakEffectsProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function StreakEffects({ editor, containerRef }: StreakEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const streakRef = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTierRef = useRef(-1);

  const [streak, setStreak] = useState(0);
  const [tierLabel, setTierLabel] = useState("");
  const [tierChanged, setTierChanged] = useState(false);

  // Spawn particles at cursor position
  const spawnParticles = useCallback((count: number, colorIndex: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Get cursor position from the editor
    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    const containerRect = container.getBoundingClientRect();

    const cx = coords.left - containerRect.left;
    const cy = coords.top - containerRect.top;

    const colors = PARTICLE_COLORS[colorIndex] || PARTICLE_COLORS[0];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.4,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Cap particles
    if (particlesRef.current.length > 50) {
      particlesRef.current = particlesRef.current.slice(-50);
    }
  }, [editor, containerRef]);

  // Screen shake
  const shake = useCallback((intensity: number) => {
    const container = containerRef.current;
    if (!container || intensity === 0) return;
    const dx = (Math.random() - 0.5) * intensity * 2;
    const dy = (Math.random() - 0.5) * intensity * 2;
    container.style.transform = `translate(${dx}px, ${dy}px)`;
    setTimeout(() => {
      container.style.transform = "";
    }, 50);
  }, [containerRef]);

  // Handle keystroke
  const handleKeystroke = useCallback(() => {
    // Clear pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    // Increment streak
    streakRef.current += 1;
    const s = streakRef.current;
    setStreak(s);

    // Get tier
    const result = getTier(s);
    if (result) {
      const { tier, index } = result;

      // Spawn particles
      spawnParticles(tier.particles, index);

      // Screen shake
      if (tier.shake > 0) shake(tier.shake);

      // Tier label
      if (index !== prevTierRef.current && tier.label) {
        setTierLabel(tier.label);
        setTierChanged(true);
        setTimeout(() => setTierChanged(false), 300);
      }
      prevTierRef.current = index;
    }

    // Reset streak after 2s of inactivity
    pauseTimerRef.current = setTimeout(() => {
      streakRef.current = 0;
      setStreak(0);
      setTierLabel("");
      prevTierRef.current = -1;
    }, 2000);
  }, [spawnParticles, shake]);

  // Listen for editor transactions (typing)
  useEffect(() => {
    const handler = () => {
      // Only count actual content changes, not selection changes
      handleKeystroke();
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [editor, handleKeystroke]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);

    const animate = (time: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 2 * dt; // gravity

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
    };
  }, [containerRef]);

  const currentTier = getTier(streak);

  return (
    <>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />

      {/* Streak counter */}
      {currentTier && (
        <div className="absolute top-2 right-3 z-20 pointer-events-none flex items-baseline gap-1.5">
          <span
            className="font-mono font-semibold text-primary tabular-nums leading-none"
            style={{ fontSize: `${Math.min(0.85 + streak * 0.003, 1.3)}rem` }}
          >
            {streak}x
          </span>
          {tierLabel && (
            <span
              key={tierLabel}
              className={`text-xs font-medium text-primary opacity-80 ${tierChanged ? "animate-streak-flash" : ""}`}
            >
              {tierLabel}
            </span>
          )}
        </div>
      )}
    </>
  );
}
