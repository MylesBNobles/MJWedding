'use client';

import { useEffect, useRef, useState } from 'react';

export function AnimatedSignature() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.7 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const duration = 4800;

    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1);
      // Quintic ease-in-out — lingers at start and end for a dramatic, deliberate feel
      const eased = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
      setProgress(eased);
      if (t >= 1) {
        setDone(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started]);

  const clipRight = `${((1 - progress) * 100).toFixed(3)}%`;

  return (
    <>
      <style>{`
        @keyframes nibGlow {
          0%, 100% { opacity: 0.9; filter: drop-shadow(0 0 4px rgba(201,166,132,0.7)); }
          50%       { opacity: 1;   filter: drop-shadow(0 0 9px rgba(201,166,132,1)); }
        }
        @keyframes sparkleIn {
          0%   { opacity: 0; transform: scale(0) rotate(-30deg); }
          65%  { opacity: 1; transform: scale(1.35) rotate(12deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes flourishIn {
          0%   { opacity: 0; transform: scaleX(0); }
          100% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>

      <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        {/* Signature text — clip reveals left to right */}
        <span
          className="font-cursive text-4xl text-[#C9A684]"
          style={{
            display: 'block',
            whiteSpace: 'nowrap',
            clipPath: `inset(-12px ${clipRight} -16px -16px round 2px)`,
          }}
        >
          Jeslin &amp; Myles
        </span>

        {/* Pen-nib cursor tracks the writing edge */}
        {!done && progress > 0.02 && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              left: `${(progress * 100).toFixed(3)}%`,
              bottom: '0.15em',
              transform: 'translateX(-40%) rotate(-15deg)',
              fontSize: '1.1rem',
              lineHeight: 1,
              animation: 'nibGlow 0.7s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          >
            ✒️
          </span>
        )}

        {/* Sparkle + underline flourish on completion */}
        {done && (
          <>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: '-1.4rem',
                top: '-0.1em',
                fontSize: '1rem',
                animation: 'sparkleIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards',
                pointerEvents: 'none',
              }}
            >
              ✨
            </span>
            {/* Underline flourish */}
            <svg
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              aria-hidden
              style={{
                position: 'absolute',
                bottom: '-0.45em',
                left: '5%',
                width: '90%',
                height: 12,
                animation: 'flourishIn 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.15s both',
                transformOrigin: 'left center',
              }}
            >
              <path
                d="M0,8 Q50,2 100,6 Q150,10 200,4"
                fill="none"
                stroke="#C9A684"
                strokeWidth="1.2"
                strokeOpacity="0.5"
                strokeLinecap="round"
              />
            </svg>
          </>
        )}
      </div>
    </>
  );
}
