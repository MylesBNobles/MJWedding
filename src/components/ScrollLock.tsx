'use client';

import { useEffect } from 'react';

// Time from first click until scroll unlocks.
// Sequence: flap (3300ms) + polaroid offset (350ms) + develop delay (200ms)
// + develop (3000ms) + small buffer (350ms) = 7200ms
const ANIMATION_MS = 7200;

const SEEN_KEY = 'std-animation-seen';

export function ScrollLock() {
  useEffect(() => {
    // Already seen the envelope animation — skip the lock entirely
    if (sessionStorage.getItem(SEEN_KEY)) {
      document.dispatchEvent(new CustomEvent('scroll-unlocked'));
      return;
    }

    let unlocked = false;

    function unlock() {
      if (unlocked) return;
      unlocked = true;
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      sessionStorage.setItem(SEEN_KEY, '1');
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
