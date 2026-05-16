"use client";

import { useEffect, useRef, useState, useMemo } from "react";

const COLORS = ["#CFE8F7", "#F6E7B2", "#F7D6C1", "#D6C6E1", "#BFCBB2", "#C9A684"];

export function GiftConfetti({ children }: { children: React.ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(false);
	const triggered = useRef(false);

	const pieces = useMemo(
		() =>
			Array.from({ length: 30 }, (_, i) => ({
				id: i,
				color: COLORS[i % COLORS.length],
				x: (Math.random() - 0.5) * 260,
				y: -(Math.random() * 150 + 30),
				rotate: Math.random() * 720 - 360,
				size: Math.random() * 5 + 5,
				delay: Math.random() * 0.3,
				duration: Math.random() * 0.5 + 0.9,
				isCircle: i % 4 === 0,
			})),
		[],
	);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !triggered.current) {
					triggered.current = true;
					setActive(true);
					setTimeout(() => setActive(false), 2400);
				}
			},
			{ threshold: 0.7 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className="relative inline-block">
			{children}
			{active && (
				<div
					aria-hidden
					className="absolute inset-0 pointer-events-none"
					style={{ overflow: "visible" }}
				>
					<div
						className="absolute"
						style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
					>
						{pieces.map((p) => (
							<div
								key={p.id}
								className="absolute"
								style={
									{
										width: p.size,
										height: p.size,
										borderRadius: p.isCircle ? "50%" : "2px",
										backgroundColor: p.color,
										top: 0,
										left: 0,
										animation: `giftConfetti ${p.duration}s ease-out ${p.delay}s both`,
										"--gx": `${p.x}px`,
										"--gy": `${p.y}px`,
										"--gr": `${p.rotate}deg`,
									} as React.CSSProperties
								}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
