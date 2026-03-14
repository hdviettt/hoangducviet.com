"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Editor } from "@tiptap/react";

// ---- Tier Definitions ----

const STREAK_TIERS = [
  { min: 5, label: "", particles: 2 },
  { min: 15, label: "Nice!", particles: 3 },
  { min: 30, label: "Great!", particles: 5 },
  { min: 60, label: "On Fire!", particles: 7 },
  { min: 120, label: "UNSTOPPABLE!", particles: 10 },
];

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

// ---- Typewriter Audio Engine ----

class TypewriterSounds {
  private ctx: AudioContext | null = null;

  private getCtx(): AudioContext | null {
    if (!this.ctx) {
      try { this.ctx = new AudioContext(); } catch { return null; }
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  // Mechanical keyboard click — two layered noise bursts
  // simulating the key strike and key bottom-out
  playKeystroke(streak: number) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const tierResult = getTier(streak);
    const tierIndex = tierResult ? tierResult.index : -1;

    // --- Layer 1: Initial key strike (sharp, high click) ---
    const strikeLen = 256;
    const strikeBuf = ctx.createBuffer(1, strikeLen, ctx.sampleRate);
    const strikeData = strikeBuf.getChannelData(0);
    for (let i = 0; i < strikeLen; i++) {
      // Sharp attack that decays quickly
      const env = Math.exp(-i / (strikeLen * 0.08));
      strikeData[i] = (Math.random() * 2 - 1) * env;
    }

    const strike = ctx.createBufferSource();
    strike.buffer = strikeBuf;

    const strikeFilter = ctx.createBiquadFilter();
    strikeFilter.type = "bandpass";
    // Random pitch variation for natural feel
    strikeFilter.frequency.value = 3000 + Math.random() * 2000;
    strikeFilter.Q.value = 1.5;

    const strikeGain = ctx.createGain();
    const baseVol = 0.06 + Math.min(tierIndex * 0.01, 0.04);
    strikeGain.gain.setValueAtTime(baseVol, now);
    strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    strike.connect(strikeFilter);
    strikeFilter.connect(strikeGain);
    strikeGain.connect(ctx.destination);
    strike.start(now);
    strike.stop(now + 0.025);

    // --- Layer 2: Bottom-out thock (lower, slightly delayed) ---
    const thockLen = 384;
    const thockBuf = ctx.createBuffer(1, thockLen, ctx.sampleRate);
    const thockData = thockBuf.getChannelData(0);
    for (let i = 0; i < thockLen; i++) {
      const env = Math.exp(-i / (thockLen * 0.15));
      thockData[i] = (Math.random() * 2 - 1) * env;
    }

    const thock = ctx.createBufferSource();
    thock.buffer = thockBuf;

    const thockFilter = ctx.createBiquadFilter();
    thockFilter.type = "lowpass";
    thockFilter.frequency.value = 800 + Math.random() * 400;
    thockFilter.Q.value = 2;

    const thockGain = ctx.createGain();
    const thockVol = 0.04 + Math.min(tierIndex * 0.008, 0.03);
    thockGain.gain.setValueAtTime(thockVol, now + 0.008);
    thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    thock.connect(thockFilter);
    thockFilter.connect(thockGain);
    thockGain.connect(ctx.destination);
    thock.start(now + 0.008);
    thock.stop(now + 0.055);

    // --- Layer 3: At higher streaks, add a subtle resonant "ping" ---
    // like a premium mechanical switch spring
    if (tierIndex >= 2) {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      // Subtle metallic ping, varies per keystroke
      osc.frequency.value = 4000 + Math.random() * 1500;
      const pingVol = 0.008 + (tierIndex - 2) * 0.004;
      oscGain.gain.setValueAtTime(pingVol, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    }
  }

  // Tier-up: satisfying typewriter carriage return "ding"
  playTierUp(tierIndex: number) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Bell ding — like a typewriter margin bell
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 2200 + tierIndex * 300;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);

    // Slight harmonic overtone for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = (2200 + tierIndex * 300) * 2.5;
    gain2.gain.setValueAtTime(0.02, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.2);
  }
}

const typingSounds = new TypewriterSounds();

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

  // Handle keystroke
  const handleKeystroke = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    streakRef.current += 1;
    const s = streakRef.current;
    setStreak(s);

    const result = getTier(s);

    // Play typewriter keystroke sound
    typingSounds.playKeystroke(s);

    if (result) {
      const { tier, index } = result;

      spawnParticles(tier.particles, index);

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
  }, [spawnParticles]);

  // Listen for editor updates
  useEffect(() => {
    const handler = () => handleKeystroke();
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
