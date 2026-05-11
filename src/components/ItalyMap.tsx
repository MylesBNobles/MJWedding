'use client';

import { useEffect, useRef, useState } from 'react';

// ── Bezier helpers ────────────────────────────────────────────────────────────
function bezierPoint(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}
function bezierTangent(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

// ── Easing ───────────────────────────────────────────────────────────────────
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ── ViewBox interpolation ─────────────────────────────────────────────────────
type VB = { x: number; y: number; w: number; h: number };
// Wide: full Italy visible + ocean to the left where the plane enters
const WIDE_VB: VB = { x: -70, y: 0, w: 460, h: 380 };
// Close: tight crop on Tuscany / Villa Di Geggiano
const CLOSE_VB: VB = { x: 94, y: 92, w: 132, h: 122 };

function lerpVB(a: VB, b: VB, t: number): VB {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  };
}

// ── Italy as a clean polygon (28 waypoints, clockwise from NW) ────────────────
const ITALY_PTS: [number, number][] = [
  [120, 22],  // NW — Alps/Liguria
  [164, 20],  // NE — Friuli/Trieste
  [188, 74],  // Adriatic — Venice/Ravenna
  [198, 130], // Adriatic — Ancona
  [198, 182], // Adriatic — Pescara
  [204, 240], // Adriatic — Foggia
  [212, 280], // Adriatic — Bari
  [214, 305], // Heel — Brindisi
  [206, 322], // Around the heel
  [195, 338], //
  [178, 352], // Arch area
  [162, 366], // Toe
  [148, 374], // Tip — Reggio Calabria
  [134, 366], // West of toe
  [126, 352], // Sole/arch (west)
  [130, 340], // Instep
  [135, 332], //
  [128, 318], // Naples area (Campania)
  [130, 296], //
  [128, 268], // Lazio south
  [128, 240], // Rome area
  [125, 212], //
  [122, 184], //
  [122, 156], // Tuscany south coast
  [122, 130], // Tuscany — Piombino
  [122, 104], // Tuscany north / La Spezia
  [118, 72],  // Liguria
  [118, 44],  // Back toward NW
];

const ITALY_D = 'M ' + ITALY_PTS.map(p => p.join(',')).join(' L ') + ' Z';

// ── Destination + flight path ─────────────────────────────────────────────────
const VILLA = { x: 162, y: 152 }; // near Siena / Villa Di Geggiano

// Cubic bezier: plane enters from left ocean, arcs up, descends to Tuscany
const PATH = { x0: -52, y0: 92, x1: 30, y1: 14, x2: 100, y2: 60, x3: VILLA.x, y3: VILLA.y };

// ── Sub-components ────────────────────────────────────────────────────────────
function PlaneIcon({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <ellipse cx={0} cy={0} rx={6} ry={2.2} fill="#C9A684" />
      <polygon points="0,-2 -9,0 0,2"  fill="#C9A684" />
      <polygon points="0,-0.8 4,-4.5 4,-2.5" fill="#C9A684" />
      <polygon points="0,0.8 4,4.5 4,2.5"   fill="#C9A684" />
      <polygon points="-3,-0.6 -6,-2.2 -6,-1.2" fill="#C9A684" />
      <polygon points="-3,0.6 -6,2.2 -6,1.2"    fill="#C9A684" />
    </g>
  );
}

function HeartPin({ visible }: { visible: boolean }) {
  const { x, y } = VILLA;
  return (
    <g style={{ transition: 'opacity 0.5s ease', opacity: visible ? 1 : 0 }}>
      {/* Pin stem */}
      <line
        x1={x} y1={y - 2} x2={x} y2={y + 5}
        stroke="#C4614A" strokeWidth={1.4} strokeLinecap="round"
      />
      {/* Heart */}
      <path
        d={`M${x},${y - 4} C${x},${y - 4} ${x - 5},${y - 9} ${x - 5},${y - 12} C${x - 5},${y - 15} ${x - 2.5},${y - 16} ${x},${y - 14} C${x + 2.5},${y - 16} ${x + 5},${y - 15} ${x + 5},${y - 12} C${x + 5},${y - 9} ${x},${y - 4} ${x},${y - 4}Z`}
        fill="#C4614A"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0)',
          transformOrigin: `${x}px ${y}px`,
          transition: 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s',
        }}
      />
    </g>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ItalyMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const DURATION = 4200;

  // Zoom timing
  const ZOOM_START = 0.44; // start pulling camera in at 44% progress
  const ZOOM_END   = 0.82; // camera fully zoomed at 82%

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    startTimeRef.current = performance.now();

    function tick(now: number) {
      const t = Math.min((now - startTimeRef.current) / DURATION, 1);
      const eased = easeInOutCubic(t);
      setProgress(eased);
      if (eased >= 1) { setPinVisible(true); return; }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started]);

  // ── Plane position ──────────────────────────────────────────────────────────
  const px = bezierPoint(progress, PATH.x0, PATH.x1, PATH.x2, PATH.x3);
  const py = bezierPoint(progress, PATH.y0, PATH.y1, PATH.y2, PATH.y3);
  const tx = bezierTangent(progress, PATH.x0, PATH.x1, PATH.x2, PATH.x3);
  const ty = bezierTangent(progress, PATH.y0, PATH.y1, PATH.y2, PATH.y3);
  const angle = (Math.atan2(ty, tx) * 180) / Math.PI;

  // ── Flight trail (sampled bezier points up to current progress) ─────────────
  const trailPts: string[] = [];
  const STEPS = 50;
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * progress;
    trailPts.push(`${bezierPoint(t, PATH.x0, PATH.x1, PATH.x2, PATH.x3)},${bezierPoint(t, PATH.y0, PATH.y1, PATH.y2, PATH.y3)}`);
  }
  const trailD = trailPts.length > 1 ? `M ${trailPts.join(' L ')}` : '';

  // ── Camera viewBox ──────────────────────────────────────────────────────────
  const zoomT = clamp((progress - ZOOM_START) / (ZOOM_END - ZOOM_START), 0, 1);
  const zoomEased = easeInOutQuint(zoomT);
  const vb = lerpVB(WIDE_VB, CLOSE_VB, zoomEased);
  const viewBox = `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`;

  // How zoomed in are we (0=wide, 1=close) — used for fading context labels
  const zoomFraction = zoomEased;

  const showPlane = progress > 0.01 && progress < 1;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3 py-2">
      <div style={{ width: '100%', maxWidth: 360, aspectRatio: '320 / 300' }}>
        <svg
          viewBox={viewBox}
          style={{ width: '100%', height: '100%', display: 'block', borderRadius: 10 }}
          aria-label="Animated map showing flight path to Villa Di Geggiano, Tuscany"
        >
          {/* Ocean */}
          <rect x={-200} y={-200} width={800} height={800} fill="#CFE8F7" />

          {/* Subtle lat/long grid */}
          {[-100,-60,-20,20,60,100,140,180,220,260,300,340,380,420].map(y => (
            <line key={`h${y}`} x1={-200} y1={y} x2={600} y2={y}
              stroke="#B8D6EC" strokeWidth={0.5} strokeDasharray="4 10" />
          ))}
          {[-60,-20,20,60,100,140,180,220,260,300,340,380,420].map(x => (
            <line key={`v${x}`} x1={x} y1={-200} x2={x} y2={600}
              stroke="#B8D6EC" strokeWidth={0.5} strokeDasharray="4 10" />
          ))}

          {/* Mediterranean Sea label — fades as camera zooms in */}
          <text
            x={30} y={310}
            fontSize={9} fontFamily="Georgia, serif" fontStyle="italic"
            fill="#8ab8d4" textAnchor="middle"
            fillOpacity={Math.max(0, 1 - zoomFraction * 3)}
          >
            Mediterranean Sea
          </text>

          {/* Plane origin nudge — only in wide view */}
          <text
            x={-48} y={84}
            fontSize={7} fontFamily="Georgia, serif" fontStyle="italic"
            fill="#8a7d6c" textAnchor="middle"
            fillOpacity={Math.max(0, 1 - zoomFraction * 4)}
          >
            ✈ USA
          </text>

          {/* Italy landmass */}
          <path d={ITALY_D} fill="#F5EFE4" stroke="#D4C4A8" strokeWidth={1} strokeLinejoin="round" />

          {/* Tuscany region highlight */}
          <ellipse
            cx={162} cy={145} rx={30} ry={24}
            fill="#F7E7CE" stroke="#C9A684" strokeWidth={0.9}
            strokeDasharray="3 4" opacity={0.85}
          />

          {/* Siena label — appears once zoomed in */}
          {pinVisible && (
            <text
              x={VILLA.x - 2} y={VILLA.y + 14}
              fontSize={5.5} fontFamily="Georgia, serif" fontStyle="italic"
              fill="#3F3A36" textAnchor="middle"
              style={{ opacity: pinVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.5s' }}
            >
              Siena, Tuscany
            </text>
          )}

          {/* Villa Di Geggiano label — appears with pin */}
          {pinVisible && (
            <text
              x={VILLA.x + 9} y={VILLA.y - 16}
              fontSize={5} fontFamily="Georgia, serif" fontStyle="italic"
              fill="#C4614A" textAnchor="start"
              style={{ opacity: 1, transition: 'opacity 0.6s ease 0.3s' }}
            >
              Villa Di Geggiano
            </text>
          )}

          {/* Cypress trees near villa — more visible once zoomed */}
          {[
            { x: 150, y: 154 }, { x: 153, y: 157 },
            { x: 172, y: 148 }, { x: 175, y: 151 },
          ].map((pos, i) => (
            <ellipse
              key={i}
              cx={pos.x} cy={pos.y - 4}
              rx={2} ry={5}
              fill="#4A5E3A"
              fillOpacity={0.55 + zoomFraction * 0.3}
            />
          ))}

          {/* Flight trail */}
          {trailD && (
            <path
              d={trailD}
              fill="none"
              stroke="#C9A684"
              strokeWidth={1.4}
              strokeDasharray="3 6"
              strokeLinecap="round"
              opacity={0.85}
            />
          )}

          {/* Animated plane */}
          {showPlane && <PlaneIcon x={px} y={py} angle={angle} />}

          {/* Heart pin at Villa Di Geggiano */}
          <HeartPin visible={pinVisible} />

          {/* Compass rose — stays in bottom-right of the visible area */}
          <g transform={`translate(${vb.x + vb.w - 18}, ${vb.y + vb.h - 18})`}>
            <circle cx={0} cy={0} r={10} fill="white" fillOpacity={0.55} stroke="#C9A684" strokeWidth={0.7} />
            <text x={0} y={-2.5} fontSize={5} textAnchor="middle" fill="#8a7d6c" fontFamily="Georgia,serif">N</text>
            <line x1={0} y1={-1.5} x2={0} y2={-8} stroke="#C9A684" strokeWidth={0.9} />
            <polygon points="0,-9 -1.2,-6.5 1.2,-6.5" fill="#C4614A" />
          </g>
        </svg>
      </div>

      {/* Caption */}
      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: '0.66rem',
        color: '#8a7d6c',
        letterSpacing: '0.14em',
        fontStyle: 'italic',
        textAlign: 'center',
      }}>
        Siena, Tuscany — June 2027
      </p>
    </div>
  );
}
