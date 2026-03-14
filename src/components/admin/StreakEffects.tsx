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

// ---- Mechanical Keyboard Audio ----
// Deep, thocky mechanical switch sounds — no high pitched tones

class MechKeyboardSounds {
  private ctx: AudioContext | null = null;
  // Pre-generated click buffers for variation
  private clickBuffers: AudioBuffer[] = [];

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.generateClickBuffers();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  // Pre-generate several click variations so each keystroke sounds slightly different
  private generateClickBuffers() {
    const ctx = this.ctx!;
    const sampleRate = ctx.sampleRate;

    for (let v = 0; v < 6; v++) {
      // Each click is ~30ms of shaped noise
      const len = Math.floor(sampleRate * 0.035);
      const buf = ctx.createBuffer(1, len, sampleRate);
      const data = buf.getChannelData(0);

      // Resonant frequency varies per buffer (deep thock character)
      const resonance = 300 + v * 80; // 300-700 Hz range — deep
      const damping = 0.12 + Math.random() * 0.06;

      for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        // Fast exponential decay envelope
        const env = Math.exp(-t / damping) * (1 - Math.exp(-t * 8000));
        // Mix of: noise (click texture) + low resonance (thock body)
        const noise = (Math.random() * 2 - 1) * 0.6;
        const tone = Math.sin(2 * Math.PI * resonance * t) * 0.4;
        const subTone = Math.sin(2 * Math.PI * (resonance * 0.5) * t) * 0.25;
        data[i] = (noise + tone + subTone) * env;
      }

      this.clickBuffers.push(buf);
    }
  }

  playKeystroke(streak: number) {
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const tierResult = getTier(streak);
    const tierIndex = tierResult ? tierResult.index : -1;

    // Pick a random click buffer
    const buf = this.clickBuffers[Math.floor(Math.random() * this.clickBuffers.length)];
    if (!buf) return;

    const source = ctx.createBufferSource();
    source.buffer = buf;
    // Slight playback rate variation for natural feel
    source.playbackRate.value = 0.9 + Math.random() * 0.2;

    // Low-pass to keep it deep and thocky
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1800 + Math.min(tierIndex * 200, 600);
    filter.Q.value = 0.7;

    // Volume: audible baseline, gets a bit fuller with streak
    const gain = ctx.createGain();
    const vol = 0.25 + Math.min(tierIndex * 0.04, 0.15);
    gain.gain.setValueAtTime(vol, now);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  // Tier-up: satisfying deep "clack" — like pressing a big switch
  playTierUp() {
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    const sampleRate = ctx.sampleRate;
    const len = Math.floor(sampleRate * 0.08);
    const buf = ctx.createBuffer(1, len, sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      const env = Math.exp(-t / 0.04) * (1 - Math.exp(-t * 5000));
      const noise = (Math.random() * 2 - 1) * 0.5;
      const thock = Math.sin(2 * Math.PI * 200 * t) * 0.5;
      const body = Math.sin(2 * Math.PI * 120 * t) * 0.3;
      data[i] = (noise + thock + body) * env;
    }

    const source = ctx.createBufferSource();
    source.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }
}

const mechSounds = new MechKeyboardSounds();

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

  const handleKeystroke = useCallback(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    streakRef.current += 1;
    const s = streakRef.current;
    setStreak(s);

    const result = getTier(s);

    // Play mechanical keyboard click
    mechSounds.playKeystroke(s);

    if (result) {
      const { tier, index } = result;

      spawnParticles(tier.particles, index);

      if (index !== prevTierRef.current && tier.label) {
        setTierLabel(tier.label);
        setTierChanged(true);
        mechSounds.playTierUp();
        setTimeout(() => setTierChanged(false), 300);
      }
      prevTierRef.current = index;
    }

    pauseTimerRef.current = setTimeout(() => {
      streakRef.current = 0;
      setStreak(0);
      setTierLabel("");
      prevTierRef.current = -1;
    }, 2000);
  }, [spawnParticles]);

  useEffect(() => {
    const handler = () => handleKeystroke();
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [editor, handleKeystroke]);

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
