'use client';

import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  radius: number;
  color: string;
  glow: boolean;
};

type Rocket = {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
};

const COLORS = [
  '#F7E7CE', // champagne
  '#EAE0D5', // pearl
  '#FFF8F0', // cream
  '#FFFFFF',  // pure white
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function explode(x: number, y: number, color: string, particles: Particle[]) {
  // Primary burst — streaks radiating outward in all directions
  const count = 130 + Math.floor(Math.random() * 50);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.15;
    const speed = 3 + Math.random() * 7;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: 0.013 + Math.random() * 0.010,
      radius: 1.4 + Math.random() * 1.4,
      color,
      glow: false,
    });
  }
  // Glowing accent sparks — slightly thicker streaks
  for (let i = 0; i < 22; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      decay: 0.014 + Math.random() * 0.008,
      radius: 2.2 + Math.random() * 2,
      color,
      glow: true,
    });
  }
}

type Props = { playing: boolean };

export function Fireworks({ playing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ playing });

  useEffect(() => {
    stateRef.current.playing = playing;
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let launchCount = 0;
    const MAX_LAUNCHES = 16;
    const particles: Particle[] = [];
    const rockets: Rocket[] = [];
    let lastLaunch = 0;

    function resize() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function launchRocket() {
      const w = canvas!.width;
      const h = canvas!.height;
      rockets.push({
        x: w * 0.08 + Math.random() * w * 0.84,
        y: h,
        vy: -(13 + Math.random() * 10),
        targetY: h * 0.08 + Math.random() * h * 0.50,
        color: randomColor(),
        trail: [],
      });
      launchCount++;
    }

    // iMessage-style: burst appears at a random screen position
    function screenBurst() {
      const w = canvas!.width;
      const h = canvas!.height;
      explode(
        w * 0.05 + Math.random() * w * 0.90,
        h * 0.05 + Math.random() * h * 0.65,
        randomColor(),
        particles,
      );
      launchCount++;
    }

    function draw(ts: number) {
      const w = canvas!.width;
      const h = canvas!.height;

      ctx!.clearRect(0, 0, w, h);

      const stillLaunching = stateRef.current.playing && launchCount < MAX_LAUNCHES;

      if (stillLaunching && ts - lastLaunch > 190) {
        if (launchCount < 5 || Math.random() < 0.55) {
          launchRocket();
          if (launchCount <= 6) launchRocket(); // double-burst opening salvo
        } else {
          screenBurst();
        }
        lastLaunch = ts;
      }

      // Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 0.75 });
        r.y += r.vy;
        r.vy += 0.22;

        r.trail.forEach((t) => {
          t.alpha -= 0.065;
          if (t.alpha <= 0) return;
          ctx!.beginPath();
          ctx!.arc(t.x, t.y, 1.8, 0, Math.PI * 2);
          ctx!.fillStyle = r.color + Math.round(t.alpha * 255).toString(16).padStart(2, '0');
          ctx!.fill();
        });
        r.trail = r.trail.filter(t => t.alpha > 0);

        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color, particles);
          rockets.splice(i, 1);
        }
      }

      // Particles — rendered as streaks based on velocity direction
      ctx!.lineCap = 'round';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) { particles.splice(i, 1); continue; }

        const alphaHex = Math.round(p.alpha * 255).toString(16).padStart(2, '0');
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        if (p.glow) {
          ctx!.shadowBlur = 12;
          ctx!.shadowColor = p.color;
        }

        if (speed > 0.8) {
          // Draw as a streak trailing behind the particle
          const tailLen = speed * 3.5;
          const nx = p.vx / speed;
          const ny = p.vy / speed;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x - nx * tailLen, p.y - ny * tailLen);
          ctx!.strokeStyle = p.color + alphaHex;
          ctx!.lineWidth = p.radius * 1.3;
          ctx!.stroke();
        } else {
          // Nearly stopped — draw as a small dot
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx!.fillStyle = p.color + alphaHex;
          ctx!.fill();
        }

        if (p.glow) ctx!.shadowBlur = 0;
      }

      if (rockets.length > 0 || particles.length > 0 || stillLaunching) {
        rafId = requestAnimationFrame(draw);
      }
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ zIndex: 25 }}
      aria-hidden
    />
  );
}
