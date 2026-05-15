"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "./SaveTheDateEnvelope.module.css";

type Props = {
  coupleNames: string;
  dateLine: string;
  venue: string;
  location: string;
};

const ENVELOPE_OPEN_MS   = 3300;
const POLAROID_OFFSET_MS = 350;   // ms after flash fires before polaroid appears
const DEVELOP_DELAY_MS   = 200;   // ms after polaroid mount before filter starts
const DEVELOP_MS         = 5000;  // filter transition duration

function playShutterSound() {
  try {
    const audio = new Audio("/audio/shutter_wedding.mp3");
    audio.play();
  } catch {
    // Audio unavailable — skip silently
  }
}

// ── Polaroid print ────────────────────────────────────────────────────────────
function PolaroidPrint({
  coupleNames,
  dateLine,
  venue,
  location,
  onReset,
  reducedMotion,
}: {
  coupleNames: string;
  dateLine: string;
  venue: string;
  location: string;
  onReset: () => void;
  reducedMotion: boolean;
}) {
  const [developed, setDeveloped] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setDeveloped(true), DEVELOP_DELAY_MS);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 25,
      }}
    >
      <div style={{ animation: reducedMotion ? "none" : "polaroidDrop 1.5s cubic-bezier(0.34,1.25,0.64,1) forwards" }}>
        {/* Polaroid frame */}
        <div
          style={{
            background: "white",
            padding: "13px 13px 68px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.30), 0 8px 24px rgba(0,0,0,0.14)",
            transform: "rotate(-2.2deg)",
            width: "clamp(300px, 72vw, 460px)",
            position: "relative",
          }}
        >
          {/* Photo — single-layer filter developing, slow and gradual */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", overflow: "hidden" }}>
            <Image
              src="/images/MJWeddingPic1.jpeg"
              alt={`${coupleNames} — Save the Date`}
              fill
              sizes="(max-width: 640px) 72vw, 460px"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                filter: developed
                  ? "brightness(1) saturate(1) blur(0px)"
                  : "brightness(5) saturate(0) blur(3px)",
                transition: reducedMotion
                  ? "none"
                  : `filter ${DEVELOP_MS}ms cubic-bezier(0.18, 0.42, 0.36, 0.98)`,
              }}
              priority
            />
          </div>

          {/* Caption */}
          <div style={{ paddingTop: "13px", textAlign: "center" }}>
            <p style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.6rem",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: "#C9A684",
              margin: "0 0 6px",
            }}>
              Save the Date
            </p>
            <p style={{
              fontFamily: "var(--font-cursive)",
              fontSize: "clamp(1.45rem, 4.2vw, 2rem)",
              color: "#3F3A36",
              lineHeight: 1.1,
              margin: "0 0 7px",
            }}>
              {coupleNames}
            </p>
            <p style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.72rem",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "#8a7d6c",
              margin: "0 0 4px",
            }}>
              {dateLine}
            </p>
            <p style={{
              fontFamily: "Georgia, serif",
              fontSize: "0.68rem",
              letterSpacing: "0.15em",
              color: "#C9A684",
              fontStyle: "italic",
              margin: 0,
            }}>
              {venue} · {location}
            </p>
          </div>
        </div>

        {/* Replay button */}
        {!reducedMotion && (
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              type="button"
              onClick={onReset}
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(201,166,132,0.35)",
                borderRadius: "999px",
                padding: "0.4rem 1.1rem",
                fontSize: "0.58rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "rgba(63,58,54,0.75)",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
              }}
            >
              Open again ↺
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function SaveTheDateEnvelope({ coupleNames, dateLine, venue, location }: Props) {
  const [runKey, setRunKey] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [bloomOn, setBloomOn] = useState(false);
  const [showPolaroid, setShowPolaroid] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => timers.current.forEach(clearTimeout);
  const shutterRef = useRef<HTMLAudioElement | null>(null);

  // Pre-create shutter audio so it can be unlocked within the tap gesture
  useEffect(() => {
    shutterRef.current = new Audio("/audio/shutter_wedding.mp3");
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReducedMotion(true);
      setHasOpened(true);
      setShowPolaroid(true);
    }
  }, []);

  useEffect(() => {
    if (reducedMotion || !hasOpened) return;

    const r1 = requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(fn, ms);
      timers.current.push(id);
    };

    // Shutter fires + flash when envelope opens
    schedule(() => {
      const shutter = shutterRef.current;
      if (shutter) { shutter.currentTime = 0; shutter.play().catch(() => {}); }
      setBloomOn(true);
    }, ENVELOPE_OPEN_MS);
    // Flash divs unmount once all animations have reached opacity 0
    schedule(() => setBloomOn(false), ENVELOPE_OPEN_MS + 420);
    // Polaroid materialises through the receding bloom
    schedule(() => setShowPolaroid(true), ENVELOPE_OPEN_MS + POLAROID_OFFSET_MS);

    // Music starts only after the photo finishes developing
    const musicAt = ENVELOPE_OPEN_MS + POLAROID_OFFSET_MS + DEVELOP_DELAY_MS + DEVELOP_MS + 150;
    schedule(() => document.dispatchEvent(new CustomEvent("music-start")), musicAt);

    // Gently scroll to reveal content below once everything has settled
    schedule(() => {
      window.scrollBy({ top: Math.round(window.innerHeight * 0.38), behavior: "smooth" });
    }, musicAt + 450);

    return () => { cancelAnimationFrame(r1); clearTimers(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey, reducedMotion, hasOpened]);

  const open = () => {
    if (!hasOpened && !reducedMotion) {
      setHasOpened(true);
      // Unlock shutter audio within this gesture so Chrome allows it later from the timer.
      const shutter = shutterRef.current;
      if (shutter) {
        shutter.muted = true;
        shutter.play().then(() => { shutter.pause(); shutter.currentTime = 0; shutter.muted = false; }).catch(() => { shutter.muted = false; });
      }
      // Dispatch synchronously so audio.play() in MusicPlayer runs within this gesture context.
      document.dispatchEvent(new CustomEvent('audio-unlock'));
    }
  };

  const reset = () => {
    if (reducedMotion) return;
    clearTimers();
    setPlaying(false);
    setBloomOn(false);
    setShowPolaroid(false);
    setHasOpened(false);
    setRunKey(k => k + 1);
  };

  const stageClass = `${styles.stage} ${playing ? styles.isPlaying : ""}`;

  return (
    <section
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#FAF7F2]"
      aria-label={`Save the Date for ${coupleNames}, ${dateLine}, ${venue}, ${location}`}
    >
      {/* Soft radial glow before click */}
      {!hasOpened && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(212,165,116,0.12) 0%, rgba(250,247,242,0) 60%)",
          }}
        />
      )}

      {/* ── Flash transition: floods screen then compresses to centre ── */}
      {bloomOn && (
        <>
          {/* Layer 1 — full-screen flood: entire viewport hits bright in ~28ms */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 40,
              pointerEvents: "none",
              background: "rgba(255, 252, 235, 0.97)",
              animation: "flashFlood 0.35s cubic-bezier(0.2, 0, 0.5, 1) forwards",
            }}
          />
          {/* Layer 2 — diagonal light leak: organic film imperfection */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 41,
              pointerEvents: "none",
              background:
                "linear-gradient(148deg, rgba(255,242,205,0.36) 0%, rgba(255,248,220,0.14) 42%, transparent 65%)",
              animation: "bloomLeak 0.38s cubic-bezier(0.15, 0, 0.4, 1) forwards",
            }}
          />
          {/* Layer 3 — warm compress: starts huge (full screen via overflow clip)
              then pulls inward to a centre point over 300ms */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 42,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse 55% 48% at 50% 50%, rgba(255,255,252,1) 0%, rgba(255,224,155,0.65) 10%, rgba(255,238,190,0.45) 26%, rgba(255,248,220,0.28) 48%, rgba(255,252,235,0.10) 66%, transparent 82%)",
              animation: "flashCompress 0.30s cubic-bezier(0.5, 0, 0.85, 0.2) forwards",
            }}
          />
        </>
      )}

      {/* Envelope stage — fades out once polaroid appears */}
      <div
        key={runKey}
        className={stageClass}
        data-reduced={reducedMotion ? "true" : "false"}
        onClick={!hasOpened ? open : undefined}
        role={!hasOpened ? "button" : undefined}
        tabIndex={!hasOpened ? 0 : undefined}
        onKeyDown={
          !hasOpened
            ? (e) => (e.key === "Enter" || e.key === " ") && open()
            : undefined
        }
        aria-label={!hasOpened ? "Open envelope" : undefined}
        style={
          showPolaroid
            ? { pointerEvents: "none" }
            : !hasOpened
            ? { cursor: "pointer" }
            : undefined
        }
      >
        <div className={styles.envelope} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.envBody} src="/images/envelope_four.png" alt="" draggable={false} />
          <div className={styles.envFlap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/envelope_four.png" alt="" draggable={false} />
          </div>
          <div className={styles.seal}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/wax_seal_gold.png"
              alt=""
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>

        {!hasOpened && (
          <div className={styles.prompt} aria-hidden>
            <svg className={styles.promptArrow} width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 13v-10M4 7l4-4 4 4" stroke="#C9A684" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={styles.promptText}>Tap to open</span>
          </div>
        )}
      </div>

      {/* Polaroid — materialises through the receding bloom */}
      {showPolaroid && (
        <PolaroidPrint
          coupleNames={coupleNames}
          dateLine={dateLine}
          venue={venue}
          location={location}
          onReset={reset}
          reducedMotion={reducedMotion}
        />
      )}
    </section>
  );
}
