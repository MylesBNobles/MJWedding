'use client';

import { useEffect, useRef, useState } from 'react';

const YOUTUBE_ID = '23nLWChvfM8';
const MUSIC_VOLUME = 25;

export function MusicPlayer() {
  const [playing,    setPlaying]    = useState(false);
  const [loaded,     setLoaded]     = useState(false);   // desktop: iframe mounted
  const [showToast,  setShowToast]  = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [entered,    setEntered]    = useState(false);
  const [musicReady, setMusicReady] = useState(false);   // fallback tap-to-play
  const [isMobile,   setIsMobile]   = useState(false);

  const iframeRef       = useRef<HTMLIFrameElement>(null);
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);   // true once unlock play/pause succeeded
  const isMobileRef     = useRef(false);    // sync copy for use in closures
  const triggeredRef    = useRef(false);
  const musicReadyRef   = useRef(false);
  const toastTimerRef   = useRef<ReturnType<typeof setTimeout>>();
  const volumeTimerRef  = useRef<ReturnType<typeof setTimeout>>();

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 500);
    return () => clearTimeout(t);
  }, []);

  // Mobile setup: create HTMLAudioElement and unlock it on the first touch gesture
  useEffect(() => {
    const mobile = window.matchMedia('(pointer: coarse)').matches;
    isMobileRef.current = mobile;
    setIsMobile(mobile);
    if (!mobile) return;

    const audio = new Audio('/audio/raindance.mp3');
    audio.loop = true;
    audio.volume = MUSIC_VOLUME / 100;
    audio.preload = 'auto';
    audioRef.current = audio;

    // audio-unlock is dispatched synchronously from inside the envelope's open()
    // handler, so audio.play() runs within iOS's user gesture context.
    function unlock() {
      audio.muted = true;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audioUnlockedRef.current = true;
      }).catch(() => {
        audio.muted = false;
        // Unlock failed — will fall back to tap-to-play via the vinyl button.
      });
    }

    document.addEventListener('audio-unlock', unlock, { once: true });
    return () => {
      document.removeEventListener('audio-unlock', unlock);
      audio.pause();
    };
  }, []);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  function showToastMessage() {
    clearTimeout(toastTimerRef.current);
    setShowToast(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setToastVisible(true)));
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setShowToast(false), 400);
    }, 6000);
  }

  function dismissToast() {
    clearTimeout(toastTimerRef.current);
    setToastVisible(false);
    setTimeout(() => setShowToast(false), 400);
  }

  // ── Desktop (YouTube iframe) helpers ───────────────────────────────────────
  function sendCmd(cmd: string) {
    iframeRef.current?.contentWindow?.postMessage(cmd, '*');
  }

  function setVolume() {
    volumeTimerRef.current = setTimeout(() => {
      sendCmd(`{"event":"command","func":"setVolume","args":[${MUSIC_VOLUME}]}`);
    }, 600);
  }

  function startDesktopMusic() {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setLoaded(true);
    setPlaying(true);
    showToastMessage();
    setVolume();
  }

  // ── music-start event (fired from SaveTheDateEnvelope after polaroid) ──────
  useEffect(() => {
    function onMusicStart() {
      const mobile = isMobileRef.current;

      if (mobile) {
        triggeredRef.current = true;
        const audio = audioRef.current;

        if (audio && audioUnlockedRef.current) {
          // Audio was unlocked by the envelope tap — autoplay without a gesture.
          audio.currentTime = 0;
          audio.play().then(() => {
            setPlaying(true);
            showToastMessage();
          }).catch(() => {
            // Shouldn't happen, but fall back gracefully.
            musicReadyRef.current = true;
            setMusicReady(true);
            showToastMessage();
          });
        } else {
          // Unlock didn't happen (e.g. user never touched the page) — show tap prompt.
          musicReadyRef.current = true;
          setMusicReady(true);
          showToastMessage();
        }
      } else {
        startDesktopMusic();
      }
    }

    document.addEventListener('music-start', onMusicStart, { once: true });
    return () => document.removeEventListener('music-start', onMusicStart);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Vinyl button toggle ────────────────────────────────────────────────────
  function toggle() {
    const mobile = isMobileRef.current;
    const audio  = audioRef.current;

    if (mobile && audio) {
      if (musicReadyRef.current) {
        // Fallback first tap — play within this gesture
        musicReadyRef.current = false;
        setMusicReady(false);
        audio.currentTime = 0;
        audio.play();
        setPlaying(true);
        showToastMessage();
        return;
      }
      if (playing) {
        audio.pause();
        setPlaying(false);
        dismissToast();
      } else {
        audio.play();
        setPlaying(true);
        showToastMessage();
      }
      return;
    }

    // Desktop: YouTube iframe
    if (!loaded) { startDesktopMusic(); return; }
    const cmd = playing
      ? '{"event":"command","func":"pauseVideo","args":""}'
      : '{"event":"command","func":"playVideo","args":""}';
    sendCmd(cmd);
    const next = !playing;
    setPlaying(next);
    if (next) showToastMessage(); else dismissToast();
  }

  // Cleanup timers on unmount
  useEffect(() => () => {
    clearTimeout(toastTimerRef.current);
    clearTimeout(volumeTimerRef.current);
  }, []);

  const toastLabel = musicReady ? 'Tap to play' : playing ? 'Now playing' : 'Paused';
  const toastHint  = playing ? 'tap vinyl to pause' : 'tap vinyl to play';

  const iframeSrc = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&enablejsapi=1&loop=1&playlist=${YOUTUBE_ID}&controls=0`;

  return (
    <>
      <style>{`
        @keyframes vinylSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes vinylPulse {
          0%, 100% { filter: drop-shadow(0 4px 14px rgba(0,0,0,0.32)); }
          50%       { filter: drop-shadow(0 4px 20px rgba(201,166,132,0.55)); }
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
              {toastLabel}
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
              {toastHint} · tap here to dismiss
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
              animation: playing
                ? 'vinylSpin 3s linear infinite'
                : musicReady
                ? 'vinylPulse 2s ease-in-out infinite'
                : 'none',
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

          {/* Play triangle shown when not playing or ready to play */}
          {(!playing || musicReady) && (
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

      {/* Hidden YouTube iframe — desktop only */}
      {loaded && !isMobile && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
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
