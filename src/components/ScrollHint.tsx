'use client';

import { useEffect, useState } from 'react';

export function ScrollHint() {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'gone'>('hidden');

  // Show 3.5 s after scroll-unlocked — safely past fireworks expiry
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function onUnlocked() {
      timer = setTimeout(() => setPhase('visible'), 3500);
    }

    document.addEventListener('scroll-unlocked', onUnlocked, { once: true });
    return () => {
      document.removeEventListener('scroll-unlocked', onUnlocked);
      clearTimeout(timer);
    };
  }, []);

  // Disappear on first scroll
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 20) {
        setPhase('gone');
        window.removeEventListener('scroll', onScroll);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (phase === 'gone') return null;

  return (
    <>
      <style>{`
        @keyframes hintBounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(6px); }
        }
        @keyframes hintSlideIn {
          from { opacity: 0; transform: translateY(-14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/*
        Outer div: ONLY handles fixed positioning + horizontal centering.
        Never animated — keeps translateX(-50%) intact at all times.
      */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
          pointerEvents: 'none',
        }}
      >
        {/*
          Inner div: handles fade + slide animation only (translateY).
          Separate from the outer transform so centering is never clobbered.
        */}
        <div
          style={{
            opacity: phase === 'visible' ? 1 : 0,
            animation: phase === 'visible'
              ? 'hintSlideIn 0.75s cubic-bezier(0.34,1.2,0.64,1) forwards'
              : 'none',
            transition: phase !== 'visible' ? 'opacity 0.5s ease' : 'none',
          }}
        >
          {/* Frosted glass pill */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(20,16,14,0.58)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(201,166,132,0.28)',
              borderRadius: '999px',
              padding: '0.75rem 1.7rem 0.9rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{
              color: 'rgba(251,247,238,0.85)',
              fontSize: '0.58rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              fontFamily: 'Georgia, serif',
            }}>
              scroll to explore
            </span>

            <div style={{ animation: 'hintBounce 1.7s ease-in-out infinite' }}>
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <path d="M2,1 L12,8 L22,1"
                  stroke="#C9A684" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2,7 L12,14 L22,7"
                  stroke="rgba(201,166,132,0.4)" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
