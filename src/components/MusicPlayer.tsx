'use client';

import { useEffect, useRef, useState } from 'react';

const YOUTUBE_ID = '23nLWChvfM8';

export function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false); // controls CSS transition
  const [entered, setEntered] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const triggeredRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const volumeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Slide-in entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 500);
    return () => clearTimeout(t);
  }, []);

  function showToastMessage() {
    clearTimeout(toastTimerRef.current);
    setShowToast(true);
    // Small delay so the mount triggers the CSS transition
    requestAnimationFrame(() => requestAnimationFrame(() => setToastVisible(true)));
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setShowToast(false), 400); // unmount after fade-out
    }, 6000);
  }

  function dismissToast() {
    clearTimeout(toastTimerRef.current);
    setToastVisible(false);
    setTimeout(() => setShowToast(false), 400);
  }

  const MUSIC_VOLUME = 25; // 0–100; low for background ambience

  function startMusic() {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setLoaded(true);
    setPlaying(true);
    showToastMessage();
    // Send volume after player initialises (~800 ms after iframe mounts)
    volumeTimerRef.current = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        `{"event":"command","func":"setVolume","args":[${MUSIC_VOLUME}]}`,
        '*',
      );
    }, 800);
  }

  // Auto-start when envelope is clicked (dispatches 'music-start' custom event)
  useEffect(() => {
    function onMusicStart() { startMusic(); }
    document.addEventListener('music-start', onMusicStart, { once: true });
    return () => document.removeEventListener('music-start', onMusicStart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle() {
    if (!loaded) {
      startMusic();
      return;
    }
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      const cmd = playing
        ? '{"event":"command","func":"pauseVideo","args":""}'
        : '{"event":"command","func":"playVideo","args":""}';
      iframe.contentWindow.postMessage(cmd, '*');
    }
    const next = !playing;
    setPlaying(next);
    if (next) {
      showToastMessage();
    } else {
      dismissToast();
    }
  }

  useEffect(() => () => {
    clearTimeout(toastTimerRef.current);
    clearTimeout(volumeTimerRef.current);
  }, []);

  return (
    <>
      <style>{`
        @keyframes vinylSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes playerIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Fixed container — vinyl + toast side by side */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 200,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.65rem',
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(18px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Toast notification */}
        {showToast && (
          <button
            onClick={dismissToast}
            aria-label="Dismiss"
            style={{
              background: 'rgba(28,24,21,0.88)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.6rem 1rem',
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
              opacity: toastVisible ? 1 : 0,
              transform: toastVisible ? 'translateX(0)' : 'translateX(12px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.18rem',
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#C9A684',
              fontSize: '0.62rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: '0.8rem' }}>♪</span>
              {playing ? 'Now playing' : 'Paused'}
            </span>
            <span style={{
              color: '#FBF7EE',
              fontSize: '0.75rem',
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
            }}>
              Raindance x Meri Zindagi
            </span>
            <span style={{
              color: '#8a7d6c',
              fontSize: '0.6rem',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              marginTop: '0.1rem',
            }}>
              {playing ? 'tap vinyl to pause' : 'tap vinyl to play'} · tap here to dismiss
            </span>
          </button>
        )}

        {/* Vinyl record button */}
        <button
          onClick={toggle}
          onMouseEnter={() => { if (!showToast) showToastMessage(); }}
          aria-label={playing ? 'Pause Raindance' : 'Play Raindance by Dave ft. Tems'}
          style={{
            width: 56,
            height: 56,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <svg
            viewBox="0 0 56 56"
            width="56"
            height="56"
            style={{
              display: 'block',
              borderRadius: '50%',
              animation: playing ? 'vinylSpin 3s linear infinite' : 'none',
              filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.32))',
              transition: 'filter 0.3s ease',
            }}
          >
            <circle cx="28" cy="28" r="27" fill="#1C1815" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="#262320" strokeWidth="1.5" />
            <circle cx="28" cy="28" r="20" fill="none" stroke="#262320" strokeWidth="1.3" />
            <circle cx="28" cy="28" r="16" fill="none" stroke="#262320" strokeWidth="1.2" />
            <path d="M10,18 Q14,8 24,6" stroke="#34302C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="28" cy="28" r="11" fill="#C9A684" />
            <circle cx="28" cy="28" r="10" fill="none" stroke="#a8865e" strokeWidth="0.6" />
            <text x="28" y="26.5" textAnchor="middle" fontSize="5" fontFamily="Georgia, serif" fontStyle="italic" fill="#FBF7EE" fillOpacity="0.9">J&amp;M</text>
            <text x="28" y="32.5" textAnchor="middle" fontSize="3.5" fontFamily="Georgia, serif" fill="#FBF7EE" fillOpacity="0.65">♥</text>
            <circle cx="28" cy="28" r="2.5" fill="#1C1815" />
          </svg>

          {/* Play triangle shown when not playing */}
          {!playing && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'rgba(201,166,132,0.1)',
            }}>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                <polygon points="0.5,0.5 12.5,7.5 0.5,14.5" fill="#FBF7EE" fillOpacity="0.88" />
              </svg>
            </div>
          )}
        </button>
      </div>

      {/* Hidden YouTube iframe — mounts on first trigger */}
      {loaded && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&enablejsapi=1&loop=1&playlist=${YOUTUBE_ID}&controls=0`}
          allow="autoplay"
          title="Raindance – Dave ft. Tems"
          style={{
            position: 'fixed',
            width: 1,
            height: 1,
            bottom: 0,
            right: 0,
            opacity: 0,
            pointerEvents: 'none',
            border: 'none',
            zIndex: -1,
          }}
        />
      )}
    </>
  );
}
