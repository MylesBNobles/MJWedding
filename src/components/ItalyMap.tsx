'use client';

import { useEffect, useRef, useState } from 'react';

// Coordinate space: 600 × 400 (matches image aspect ratio)
const W = 600, H = 400;

// Single cubic bezier: NY → Tuscany, arching north over the Atlantic
const NY = { x: 172, y: 140 };
const TU = { x: 432, y: 165 };
const C1 = { x: 240, y: 30  };
const C2 = { x: 370, y: 30  };

function bz(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
}
function bt(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return 3*u*u*(p1-p0) + 6*u*t*(p2-p1) + 3*t*t*(p3-p2);
}

function planePos(t: number) {
  return {
    x:     bz(t, NY.x, C1.x, C2.x, TU.x),
    y:     bz(t, NY.y, C1.y, C2.y, TU.y),
    angle: Math.atan2(
      bt(t, NY.y, C1.y, C2.y, TU.y),
      bt(t, NY.x, C1.x, C2.x, TU.x),
    ) * 180 / Math.PI,
  };
}

function easeInOut(t: number) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
}

// Build the trail path from t=0 up to `progress`
function trailPath(progress: number) {
  const steps = 80;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * progress;
    const x = bz(t, NY.x, C1.x, C2.x, TU.x).toFixed(1);
    const y = bz(t, NY.y, C1.y, C2.y, TU.y).toFixed(1);
    d += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
  }
  return d;
}

function PlaneIcon({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} filter="url(#plane-glow)">
      {/* Wings */}
      <path d="M 2,-3 L -3,-18 L -8,-16 L -2,0" fill="white"/>
      <path d="M 2,3 L -3,18 L -8,16 L -2,0" fill="white"/>
      {/* Tail fins */}
      <path d="M -6,-1.5 L -10,-8 L -13,-7 L -8,0" fill="white"/>
      <path d="M -6,1.5 L -10,8 L -13,7 L -8,0" fill="white"/>
      {/* Fuselage */}
      <ellipse cx={0} cy={0} rx={11} ry={3} fill="white"/>
      {/* Nose cone */}
      <ellipse cx={11} cy={0} rx={2.5} ry={1.6} fill="white"/>
    </g>
  );
}

function HeartPin({ x, y, visible }: { x: number; y: number; visible: boolean }) {
  return (
    <g style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.2s ease' }}>
      {/* Pin stem */}
      <line x1={x} y1={y} x2={x} y2={y - 7} stroke="#C4614A" strokeWidth={2.5} strokeLinecap="round"/>
      {/* Heart — drops in with a bounce, then pulses */}
      <g style={{
        transformOrigin: `${x}px ${y}px`,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-22px) scale(0.3)',
        transition: visible
          ? 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s'
          : 'none',
      }}>
        <path
          d={`M${x},${y-10}
              C${x},${y-10} ${x-14},${y-22} ${x-14},${y-30}
              C${x-14},${y-39} ${x-7},${y-41} ${x},${y-37}
              C${x+7},${y-41} ${x+14},${y-39} ${x+14},${y-30}
              C${x+14},${y-22} ${x},${y-10} ${x},${y-10}Z`}
          fill="#C4614A"
        />
        {/* White highlight */}
        <circle cx={x - 4} cy={y - 32} r={3} fill="rgba(255,255,255,0.28)"/>
      </g>
      {/* Label — white with dark outline so it pops on any background */}
      <g style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease 0.55s',
      }}>
        <text
          x={x} y={y + 18}
          fontSize={10} fontFamily="Georgia,serif" fontStyle="italic"
          textAnchor="middle"
          fill="white"
          stroke="rgba(28,15,8,0.65)" strokeWidth={3} paintOrder="stroke"
        >
          Villa Di Geggiano
        </text>
      </g>
    </g>
  );
}

export function ItalyMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress,    setProgress]    = useState(0);
  const [started,     setStarted]     = useState(false);
  const [done,        setDone]        = useState(false);
  const [pinShown,    setPinShown]    = useState(false);
  const [replayCount, setReplayCount] = useState(0);
  const rafRef    = useRef<number>(0);
  const startRef  = useRef<number>(0);
  const pinTimer  = useRef<ReturnType<typeof setTimeout>>();
  const DURATION  = 5500;

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    cancelAnimationFrame(rafRef.current);
    clearTimeout(pinTimer.current);
    setProgress(0); setDone(false); setPinShown(false);
    startRef.current = performance.now();
    function tick(now: number) {
      const raw = Math.min((now - startRef.current) / DURATION, 1);
      setProgress(easeInOut(raw));
      if (raw >= 1) { setDone(true); return; }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(pinTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, replayCount]);

  // Drop the pin a beat after landing
  useEffect(() => {
    if (!done) return;
    pinTimer.current = setTimeout(() => setPinShown(true), 350);
    return () => clearTimeout(pinTimer.current);
  }, [done]);

  function replay() {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(pinTimer.current);
    setProgress(0); setDone(false); setPinShown(false);
    setReplayCount(c => c + 1);
  }

  const t = Math.max(0.001, Math.min(0.999, progress));
  const { x, y, angle } = planePos(t);
  const showPlane = progress > 0.01 && !done;
  const trail = progress > 0.01 ? trailPath(t) : '';

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3 py-2">
      <div style={{ width: '100%', maxWidth: 560, position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/vintage_travel_map.png"
          alt="Vintage travel map showing our journey from the United States to Tuscany, Italy"
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
          draggable={false}
        />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden
        >

          <defs>
            {/* Glow filter for plane */}
            <filter id="plane-glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1"/>
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2"/>
              <feMerge>
                <feMergeNode in="blur1"/>
                <feMergeNode in="blur2"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Glow filter for trail */}
            <filter id="trail-glow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Contrail — glowing white dashed line tracing the path */}
          {trail && (
            <>
              {/* Soft glow layer */}
              <path d={trail} fill="none"
                stroke="rgba(255,255,255,0.35)" strokeWidth={5}
                strokeLinecap="round" filter="url(#trail-glow)"/>
              {/* Crisp dashed line */}
              <path d={trail} fill="none"
                stroke="rgba(255,255,255,0.88)" strokeWidth={1.8}
                strokeDasharray="6 5" strokeLinecap="round"/>
            </>
          )}

          {/* Glowing plane */}
          {showPlane && <PlaneIcon x={x} y={y} angle={angle} />}

          {/* Heart pin drops in after landing */}
          <HeartPin x={TU.x} y={TU.y} visible={pinShown}/>
        </svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <p style={{
          fontFamily: 'Georgia,serif', fontSize: '0.66rem',
          color: '#8a7d6c', letterSpacing: '0.14em', fontStyle: 'italic',
        }}>
          Siena, Tuscany — June 2027
        </p>
        {done && (
          <button
            onClick={replay}
            aria-label="Replay flight animation"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: 'Georgia,serif', fontSize: '0.6rem', color: '#C9A684',
              letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.25rem',
              opacity: 0.8, transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
          >
            ↻ replay
          </button>
        )}
      </div>
    </div>
  );
}
