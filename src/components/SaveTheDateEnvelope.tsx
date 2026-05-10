"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SaveTheDateEnvelope.module.css";
import { Fireworks } from "./Fireworks";

type Props = {
	coupleNames: string;
	dateLine: string;
	venue: string;
	location: string;
};

const ENVELOPE_OPEN_MS = 3300; // flap fully open: 1700ms delay + 1600ms duration
const TOTAL_MS = ENVELOPE_OPEN_MS + 2800; // hero starts 2.8s after envelope is fully open

export function SaveTheDateEnvelope({
	coupleNames,
	dateLine,
	venue,
	location,
}: Props) {
	const [runKey, setRunKey] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [launched, setLaunched] = useState(false); // black bg + fireworks, fires after envelope opens
	const [revealed, setRevealed] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const finishTimer = useRef<number | null>(null);
	const launchTimer = useRef<number | null>(null);
	const startTimer = useRef<number | null>(null);

	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (mq.matches) {
			setReducedMotion(true);
			setHasOpened(true);
			setRevealed(true);
		}
	}, []);

	// Fires when the user clicks to open (hasOpened flips true) or after reset (new runKey).
	useEffect(() => {
		if (reducedMotion || !hasOpened) return;
		const raf1 = window.requestAnimationFrame(() => {
			const raf2 = window.requestAnimationFrame(() => {
				setPlaying(true);
			});
			startTimer.current = raf2;
		});
		// Black overlay + fireworks start once the envelope flap is fully open
		launchTimer.current = window.setTimeout(() => {
			setLaunched(true);
		}, ENVELOPE_OPEN_MS);
		finishTimer.current = window.setTimeout(() => {
			setRevealed(true);
		}, TOTAL_MS);
		return () => {
			window.cancelAnimationFrame(raf1);
			if (startTimer.current) window.cancelAnimationFrame(startTimer.current);
			if (launchTimer.current) window.clearTimeout(launchTimer.current);
			if (finishTimer.current) window.clearTimeout(finishTimer.current);
		};
	}, [runKey, reducedMotion, hasOpened]);

	const open = () => {
		if (hasOpened || reducedMotion) return;
		setHasOpened(true);
	};

	const reset = () => {
		if (reducedMotion) return;
		setPlaying(false);
		setLaunched(false);
		setRevealed(false);
		setHasOpened(false);
		setRunKey((k) => k + 1);
	};

	const stageClass = `${styles.stage} ${playing ? styles.isPlaying : ""}`;

	return (
		<section
			className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-[#FAF7F2]"
			aria-label={`Save the Date for ${coupleNames}, ${dateLine}, ${venue}, ${location}`}
		>
			{/* Soft radial glow — visible before click */}
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

			{/* Black background — fades in after envelope flap is fully open */}
			{launched && !reducedMotion && (
				<div className={styles.blackOverlay} aria-hidden />
			)}

			{/* Fireworks — starts once envelope is open, floats above everything including hero */}
			{launched && !reducedMotion && (
				<Fireworks playing={launched} />
			)}

			{/* Envelope stage — clickable before opened */}
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
				style={!hasOpened ? { cursor: "pointer" } : undefined}
			>
				<div className={styles.envelope} aria-hidden="true">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						className={styles.envBody}
						src="/images/envelope_four.png"
						alt=""
						draggable={false}
					/>

					<div className={styles.envFlap}>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/images/envelope_four.png"
							alt=""
							draggable={false}
						/>
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

				{/* Tap-to-open prompt — hidden once clicked */}
				{!hasOpened && (
					<div className={styles.prompt} aria-hidden>
						<svg
							className={styles.promptArrow}
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
						>
							<path
								d="M8 13v-10M4 7l4-4 4 4"
								stroke="#C9A684"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span className={styles.promptText}>Tap invitation to open</span>
					</div>
				)}
			</div>

			{/* Full-screen hero — rises in after animation completes */}
			{revealed && (
				<div
					className={styles.heroOverlay}
					role="region"
					aria-label="Save the Date"
				>
					<div className={styles.heroPhoto} />
					<div className={styles.heroGradient} />

					<div className={styles.heroContent}>
						<p className={styles.heroEyebrow}>Save the Date</p>
						<h2 className={styles.heroNames}>{coupleNames}</h2>
						<div className={styles.heroRule} aria-hidden />
						<p className={styles.heroDate}>{dateLine}</p>
						<p className={styles.heroVenue}>{venue} · {location}</p>
						<p className={styles.heroFoot}>Formal invitation to follow</p>
					</div>

					{/* Scroll indicator — fades out automatically after 5s */}
					<div className={styles.heroScroll} aria-hidden>
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={styles.heroScrollArrow}>
							<path d="M9 3v12M4 10l5 5 5-5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
						</svg>
						<span className={styles.heroScrollText}>Scroll to explore</span>
					</div>

					{!reducedMotion && (
						<button
							type="button"
							onClick={reset}
							className="absolute bottom-6 right-6 z-20 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/90 shadow-sm backdrop-blur-sm transition hover:bg-white/25"
							aria-label="Open envelope again"
						>
							Open envelope again
						</button>
					)}
				</div>
			)}
		</section>
	);
}
