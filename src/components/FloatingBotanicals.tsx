'use client';

export function FloatingBotanicals() {
  return (
    <>
      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-4deg) translateY(0px); }
          50%       { transform: rotate(4deg)  translateY(-8px); }
        }
        @keyframes swayR {
          0%, 100% { transform: scaleX(-1) rotate(-4deg) translateY(0px); }
          50%       { transform: scaleX(-1) rotate(4deg)  translateY(-8px); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-10px) rotate(2deg); }
        }
      `}</style>

      {/* Left sprig */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '0.5rem',
          top: '18%',
          animation: 'sway 7s ease-in-out infinite',
          transformOrigin: 'bottom center',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      >
        <svg width="52" height="90" viewBox="0 0 52 90" fill="none">
          {/* Stem */}
          <path d="M26,88 Q22,60 26,30 Q28,10 26,2" stroke="#4A5E3A" strokeWidth="1.4" strokeLinecap="round" />
          {/* Leaves left */}
          <ellipse cx="16" cy="28" rx="10" ry="4.5" fill="#4A5E3A" transform="rotate(-40 16 28)" />
          <ellipse cx="14" cy="50" rx="10" ry="4.5" fill="#BFCBB2" transform="rotate(-35 14 50)" />
          <ellipse cx="16" cy="70" rx="9"  ry="4"   fill="#4A5E3A" transform="rotate(-30 16 70)" />
          {/* Leaves right */}
          <ellipse cx="36" cy="38" rx="10" ry="4.5" fill="#BFCBB2" transform="rotate(40 36 38)" />
          <ellipse cx="36" cy="60" rx="10" ry="4.5" fill="#4A5E3A" transform="rotate(35 36 60)" />
          {/* Small flower at top */}
          <circle cx="26" cy="4"  r="4"   fill="#F7D6C1" opacity="0.9" />
          <circle cx="22" cy="8"  r="3.5" fill="#F7D6C1" opacity="0.7" />
          <circle cx="30" cy="8"  r="3.5" fill="#F7D6C1" opacity="0.7" />
          <circle cx="26" cy="6"  r="2"   fill="#C9A684" />
        </svg>
      </div>

      {/* Right sprig (mirrored) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '0.5rem',
          top: '32%',
          animation: 'swayR 8s ease-in-out infinite 1.5s',
          transformOrigin: 'bottom center',
          opacity: 0.20,
          pointerEvents: 'none',
        }}
      >
        <svg width="48" height="80" viewBox="0 0 52 90" fill="none">
          <path d="M26,88 Q22,60 26,30 Q28,10 26,2" stroke="#4A5E3A" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="16" cy="28" rx="10" ry="4.5" fill="#BFCBB2"  transform="rotate(-40 16 28)" />
          <ellipse cx="14" cy="50" rx="10" ry="4.5" fill="#4A5E3A"  transform="rotate(-35 14 50)" />
          <ellipse cx="16" cy="70" rx="9"  ry="4"   fill="#BFCBB2"  transform="rotate(-30 16 70)" />
          <ellipse cx="36" cy="38" rx="10" ry="4.5" fill="#4A5E3A"  transform="rotate(40 36 38)" />
          <ellipse cx="36" cy="60" rx="10" ry="4.5" fill="#BFCBB2"  transform="rotate(35 36 60)" />
          <circle cx="26" cy="4"  r="4"   fill="#D6C6E1" opacity="0.9" />
          <circle cx="22" cy="8"  r="3.5" fill="#D6C6E1" opacity="0.7" />
          <circle cx="30" cy="8"  r="3.5" fill="#D6C6E1" opacity="0.7" />
          <circle cx="26" cy="6"  r="2"   fill="#C9A684" />
        </svg>
      </div>

      {/* Small floating sprig lower left */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '1rem',
          top: '62%',
          animation: 'floatUp 9s ease-in-out infinite 3s',
          opacity: 0.15,
          pointerEvents: 'none',
        }}
      >
        <svg width="36" height="56" viewBox="0 0 36 56" fill="none">
          <path d="M18,54 Q15,36 18,14 Q19,4 18,0" stroke="#4A5E3A" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="10" cy="18" rx="8" ry="3.5" fill="#4A5E3A" transform="rotate(-38 10 18)" />
          <ellipse cx="10" cy="36" rx="8" ry="3.5" fill="#BFCBB2" transform="rotate(-32 10 36)" />
          <ellipse cx="26" cy="26" rx="8" ry="3.5" fill="#4A5E3A" transform="rotate(38 26 26)" />
        </svg>
      </div>
    </>
  );
}
