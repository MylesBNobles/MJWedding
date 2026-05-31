'use client';

import { useEffect } from 'react';

// How long after clicking the envelope before scrolling unlocks.
// Sequence: flap (3300ms) + bloom+polaroid (3750ms) + develop delay (200ms)
// + develop (7000ms) ≈ 10950ms. Unlock just as developing completes.
const ANIMATION_MS = 10800;

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
