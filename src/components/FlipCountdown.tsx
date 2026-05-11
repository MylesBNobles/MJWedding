'use client';

import { useEffect, useRef, useState } from 'react';

const WEDDING_DATE = new Date("2027-06-12T14:30:00Z");

function getTimeLeft() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

// Single digit split-flap card
function FlipCard({ digit }: { digit: string }) {
  const [displayed, setDisplayed] = useState(digit);
  const [animKey, setAnimKey] = useState(0);
  const prevRef = useRef(digit);

  useEffect(() => {
    if (digit === prevRef.current) return;
    prevRef.current = digit;
    setDisplayed(digit);
    setAnimKey(k => k + 1);
  }, [digit]);

  return (
    <div
      className="relative overflow-hidden rounded-[6px] flex items-center justify-center"
      style={{
        width:  'clamp(2rem, 6vw, 3rem)',
        height: 'clamp(3.2rem, 9.5vw, 4.8rem)',
        backgroundColor: '#3F3A36',
        boxShadow: '0 4px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Horizontal split line — classic split-flap detail */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-black/40 z-10" />
      <span
        key={animKey}
        style={{
          fontFamily: 'var(--font-header)',
          fontSize: 'clamp(1.8rem, 5.5vw, 2.8rem)',
          color: '#FBF7EE',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          display: 'block',
          animation: animKey > 0 ? 'flipIn 0.38s cubic-bezier(0.23, 1, 0.32, 1) forwards' : 'none',
        }}
      >
        {displayed}
      </span>
    </div>
  );
}

function FlipUnit({ value, label, digits = 2 }: { value: number | null; label: string; digits?: number }) {
  const str = value === null ? '-'.repeat(digits) : String(value).padStart(digits, '0');
  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex gap-[3px]">
        {Array.from({ length: digits }, (_, i) => (
          <FlipCard key={i} digit={str[i] ?? '0'} />
        ))}
      </div>
      <span className="uppercase text-[#C9A684]" style={{ fontSize: '0.52rem', letterSpacing: '0.32em' }}>
        {label}
      </span>
    </div>
  );
}

function CypressTree({ height = 72, opacity = 0.18 }: { height?: number; opacity?: number }) {
  const w = Math.round(height * 0.3);
  const h = height;
  const cx = w / 2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden>
      <path
        d={`M${cx},${h} C${w*0.08},${h*0.9} ${w*0.04},${h*0.74} ${w*0.2},${h*0.6} C${w*0.06},${h*0.57} ${w*0.07},${h*0.44} ${w*0.24},${h*0.33} C${w*0.09},${h*0.31} ${w*0.11},${h*0.17} ${cx},${h*0.04} C${w*0.89},${h*0.17} ${w*0.91},${h*0.31} ${w*0.76},${h*0.33} C${w*0.93},${h*0.44} ${w*0.94},${h*0.57} ${w*0.8},${h*0.6} C${w*0.96},${h*0.74} ${w*0.92},${h*0.9} ${cx},${h}Z`}
        fill="#4A5E3A"
        fillOpacity={opacity}
      />
    </svg>
  );
}

export function FlipCountdown() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { value: time?.days    ?? null, label: 'Days',  digits: 3 },
    { value: time?.hours   ?? null, label: 'Hours', digits: 2 },
    { value: time?.minutes ?? null, label: 'Min',   digits: 2 },
    { value: time?.seconds ?? null, label: 'Sec',   digits: 2 },
  ];

  return (
    <>
      <style>{`
        @keyframes flipIn {
          0%   { transform: translateY(-70%); opacity: 0; }
          55%  { opacity: 1; }
          100% { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div className="text-center py-16 px-4">
        <p className="text-[0.6rem] uppercase tracking-[0.42em] text-[#8a7d6c] mb-10">
          Counting Down to Tuscany
        </p>
        <div className="flex items-end justify-center">
          {/* Left cypress grove */}
          <div className="hidden sm:flex items-end gap-1 mr-5 mb-9">
            <CypressTree height={50} opacity={0.13} />
            <CypressTree height={70} opacity={0.17} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {units.map(({ value, label, digits }, i) => (
              <div key={label} className="flex items-center gap-2 sm:gap-3">
                <FlipUnit value={value} label={label} digits={digits} />
                {i < 3 && (
                  <span
                    className="text-[#C9A684] mb-8"
                    style={{
                      fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)',
                      fontFamily: 'var(--font-header)',
                      opacity: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    :
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Right cypress grove (mirrored) */}
          <div className="hidden sm:flex items-end gap-1 ml-5 mb-9" style={{ transform: 'scaleX(-1)' }}>
            <CypressTree height={50} opacity={0.13} />
            <CypressTree height={70} opacity={0.17} />
          </div>
        </div>
      </div>
    </>
  );
}
