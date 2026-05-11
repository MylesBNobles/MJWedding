'use client';

import { useEffect } from 'react';

// How long after clicking the envelope before scrolling unlocks.
// The animation sequence is: seal (1000ms) + flap (1700+1600ms) + hero fade (5500ms)
// TOTAL_MS in SaveTheDateEnvelope = 6100ms, so 6700 is a safe buffer.
const ANIMATION_MS = 6700;

export function ScrollLock() {
  useEffect(() => {
    let unlocked = false;

    function unlock() {
      if (unlocked) return;
      unlocked = true;
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.dispatchEvent(new CustomEvent('scroll-unlocked'));
    }

    // Lock immediately
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // First click = user opened the envelope → start the animation timer
    function onFirstClick() {
      setTimeout(unlock, ANIMATION_MS);
    }
    window.addEventListener('click', onFirstClick, { once: true });

    // Safety valve — unlock after 40 s even if user never clicks
    const safety = setTimeout(unlock, 40_000);

    return () => {
      clearTimeout(safety);
      window.removeEventListener('click', onFirstClick);
      unlock();
    };
  }, []);

  return null;
}
