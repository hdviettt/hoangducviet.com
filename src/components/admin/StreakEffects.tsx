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
  ["#fb923c", "#fdba74", "#fed7aa"],
  ["#f97316", "#fb923c", "#fdba74"],
  ["#ea580c", "#f97316", "#fb923c"],
  ["#dc2626", "#f97316", "#fbbf24", "#fb923c"],
  ["#dc2626", "#f97316", "#fbbf24", "#ffffff", "#fb923c"],
];

function getTier(streak: number) {
  for (let i = STREAK_TIERS.length - 1; i >= 0; i--) {
    if (streak >= STREAK_TIERS[i].min) return { tier: STREAK_TIERS[i], index: i };
  }
  return null;
}

// ---- Audio Engine ----

class TypingSounds {
  private ctx: AudioContext | null = null;
  private initialized = false;

  private getCtx(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.initialized = true;
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Base typing click — short noise burst
  playKeystroke(streak: number) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const result = getTier(streak);

    // Base click: filtered noise
    const bufferSize = 512;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 4000 + (result ? result.index * 800 : 0);

    const gain = ctx.createGain();
    const baseVol = 0.04;
    const tierBonus = result ? result.index * 0.015 : 0;
    gain.gain.setValueAtTime(baseVol + tierBonus, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.04);

    // At higher tiers, add a pitched tone
    if (result && result.index >= 2) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      // Pitch rises with tier
      const baseFreq = 800 + result.index * 200;
      // Slight random variation for each keystroke
      osc.frequency.value = baseFreq + (Math.random() - 0.5) * 100;
      osc.type = "sine";

      const oscVol = 0.02 + result.index * 0.008;
      oscGain.gain.setValueAtTime(oscVol, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  }

  // Tier-up fanfare
  playTierUp(tierIndex: number) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
    const noteFreq = notes[Math.min(tierIndex, notes.length - 1)];

    // Quick ascending chime
    for (let i = 0; i <= Math.min(tierIndex, 2); i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = noteFreq * (1 + i * 0.25);
      gain.gain.setValueAtTime(0.06, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.15);
    }
  }
}

const typingSounds = new TypingSounds();

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
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [streak, setStreak] = useState(0);
  const [tierLabel, setTierLabel] = useState("");
  const [tierChanged, setTierChanged] = useState(false);

  // Spawn particles at cursor position
  const spawnParticles = useCallback((count: number, colorIndex: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    const containerRect = container.getBoundingClientRect();

    const cx = coords.left - containerRect.left;
    const cy = coords.top - containerRect.top + container.scrollTop;

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

    if (particlesRef.current.length > 50) {
      particlesRef.current = particlesRef.current.slice(-50);
    }
  }, [editor, containerRef]);

  // Screen shake — uses CSS class approach to avoid overflow issues
  const shake = useCallback((intensity: number) => {
    const container = containerRef.current;
    if (!container || intensity === 0) return;

    // Apply random offset via CSS custom properties
    const dx = (Math.random() - 0.5) * intensity * 2;
    const dy = (Math.random() - 0.5) * intensity * 2;
    container.style.setProperty("--shake-x", `${dx}px`);
    container.style.setProperty("--shake-y", `${dy}px`);
    container.classList.add("streak-shaking");

    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = setTimeout(() => {
      container.classList.remove("streak-shaking");
    }, 50);
  }, [containerRef]);

  // Handle keystroke
  const handleKeystroke = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    streakRef.current += 1;
    const s = streakRef.current;
    setStreak(s);

    const result = getTier(s);

    // Play keystroke sound
    typingSounds.playKeystroke(s);

    if (result) {
      const { tier, index } = result;

      spawnParticles(tier.particles, index);

      if (tier.shake > 0) shake(tier.shake);

      // Tier change
      if (index !== prevTierRef.current && tier.label) {
        setTierLabel(tier.label);
        setTierChanged(true);
        typingSounds.playTierUp(index);
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

  // Listen for editor updates
  useEffect(() => {
    const handler = () => handleKeystroke();
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
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
      canvas.height = container.scrollHeight;
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
        p.vy += 2 * dt;

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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />

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
