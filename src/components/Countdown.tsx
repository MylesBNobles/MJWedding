"use client";

import { useEffect, useState } from "react";

// 4:30 PM CET (UTC+2 in June) = 14:30 UTC
const WEDDING_DATE = new Date("2027-06-12T14:30:00Z");

function getTimeLeft() {
	const diff = WEDDING_DATE.getTime() - Date.now();
	if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
	return {
		days: Math.floor(diff / 86400000),
		hours: Math.floor((diff % 86400000) / 3600000),
		minutes: Math.floor((diff % 3600000) / 60000),
		seconds: Math.floor((diff % 60000) / 1000),
	};
}

function pad(n: number) {
	return String(n).padStart(2, "0");
}

export function Countdown() {
	const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

	useEffect(() => {
		setTime(getTimeLeft());
		const id = setInterval(() => setTime(getTimeLeft()), 1000);
		return () => clearInterval(id);
	}, []);

	const units = [
		{ value: time?.days ?? null, label: "Days" },
		{ value: time?.hours ?? null, label: "Hours" },
		{ value: time?.minutes ?? null, label: "Minutes" },
		{ value: time?.seconds ?? null, label: "Seconds" },
	];

	return (
		<div className="text-center py-16 px-4">
			<p className="text-xs uppercase tracking-[0.42em] text-[#8a7d6c] mb-10">
				Counting Down to the Big Day
			</p>
			<div className="flex justify-center gap-4 sm:gap-10">
				{units.map(({ value, label }, i) => (
					<div key={label} className="flex items-center gap-4 sm:gap-10">
						<div className="flex flex-col items-center">
							<span className="font-header text-5xl sm:text-7xl text-[#3F3A36] tabular-nums leading-none">
								{value === null ? "--" : pad(value)}
							</span>
							<span className="mt-2 text-[0.58rem] uppercase tracking-[0.3em] text-[#8a7d6c]">
								{label}
							</span>
						</div>
						{i < 3 && (
							<span className="font-header text-3xl sm:text-5xl text-[#C9A684] leading-none mb-4">
								:
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
