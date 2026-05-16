'use client';

import Link from 'next/link';
import { useRef } from 'react';

const PETAL_COLORS = ['#F7D6C1', '#D6C6E1', '#BFCBB2', '#C9A684', '#F6E7B2', '#E8C4B8'];

export function RSVPButton() {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  function burst() {
    const container = containerRef.current;
    if (!container) return;

    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + (Math.random() - 0.5) * 20;
      const distance = 38 + Math.random() * 22;
      const color = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      const size = 7 + Math.random() * 5;
      const id = idRef.current++;

      const el = document.createElement('div');
      el.setAttribute('data-petal', String(id));
      el.style.cssText = `
        position: absolute;
        top: 50%; left: 50%;
        width: ${size}px; height: ${size}px;
        border-radius: 60% 40% 60% 40%;
        background: ${color};
        pointer-events: none;
        transform: translate(-50%, -50%);
        opacity: 1;
        z-index: 10;
        transition: transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                    opacity 0.55s ease 0.1s;
      `;
      container.appendChild(el);

      // Force reflow
      el.getBoundingClientRect();

      const rad = (angle * Math.PI) / 180;
      const dx = Math.cos(rad) * distance;
      const dy = Math.sin(rad) * distance;

      el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${angle * 1.5}deg) scale(0.6)`;
      el.style.opacity = '0';

      setTimeout(() => el.remove(), 750);
    }
  }

  return (
    <>
      <style>{`
        .rsvp-btn {
          display: inline-block;
          background: #C9A684;
          color: white;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          padding: 0.875rem 2rem;
          border-radius: 9999px;
          transition: background-color 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 2px 12px rgba(201,166,132,0.18);
          text-decoration: none;
        }
        .rsvp-btn:hover {
          background: #a8865e;
          box-shadow: 0 4px 20px rgba(201,166,132,0.32);
          transform: translateY(-1px);
        }
      `}</style>
      <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }} onMouseEnter={burst}>
        <Link href="/rsvp" className="rsvp-btn" target="_blank" rel="noopener noreferrer">
          RSVP Now →
        </Link>
      </div>
    </>
  );
}
