import Link from "next/link";
import { FadeUp } from "@/components/FadeUp";
import { itineraryEvents } from "@/lib/mockData";
import { EventItem } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(time: string): string {
	const [h, m] = time.split(":").map(Number);
	const period = h >= 12 ? "PM" : "AM";
	const hour = h % 12 || 12;
	return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

// ── Decorative components ─────────────────────────────────────────────────────

function BotanicalRule() {
	return (
		<div className="flex items-center justify-center my-14" aria-hidden>
			<svg viewBox="0 0 320 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm">
				<line x1="0" y1="16" x2="108" y2="16" stroke="#C9A684" strokeWidth="0.6" strokeOpacity="0.28" />
				<line x1="212" y1="16" x2="320" y2="16" stroke="#C9A684" strokeWidth="0.6" strokeOpacity="0.28" />
				<path d="M110,16 L133,16" stroke="#BFCBB2" strokeWidth="0.9" strokeOpacity="0.7" />
				<ellipse cx="116" cy="12" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(-25 116 12)" />
				<ellipse cx="122" cy="20" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(25 122 20)" />
				<ellipse cx="128" cy="12" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(-25 128 12)" />
				<path d="M187,16 L210,16" stroke="#BFCBB2" strokeWidth="0.9" strokeOpacity="0.7" />
				<ellipse cx="192" cy="12" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(25 192 12)" />
				<ellipse cx="198" cy="20" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(-25 198 20)" />
				<ellipse cx="204" cy="12" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(25 204 12)" />
			</svg>
		</div>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-[0.62rem] uppercase tracking-[0.46em] text-[#8a7d6c] mb-3">
			<span style={{ letterSpacing: 0, textTransform: "none", color: "#C9A684", marginRight: "8px", fontSize: "0.8rem" }}>✿</span>
			{children}
		</p>
	);
}

// ── Event card ────────────────────────────────────────────────────────────────

function EventCard({ event, connector = false }: { event: EventItem; connector?: boolean }) {
	return (
		<div>
			<div className="relative bg-white border border-[#EDE6D8] rounded-xl p-6 overflow-hidden">
				<div className="absolute left-0 top-4 bottom-4 w-[3px] bg-gradient-to-b from-[#C9A684] to-[#BFCBB2] rounded-full" />
				<div className="pl-4">
					<div className="flex items-start justify-between gap-3 mb-2">
						<h3 className="font-header text-xl text-[#3F3A36] leading-tight">{event.title}</h3>
						{event.dressCode && (
							<span className="flex-shrink-0 text-[0.58rem] uppercase tracking-[0.2em] text-[#8a7d6c] border border-[#C9A684]/35 px-2.5 py-1 rounded-full mt-0.5">
								{event.dressCode}
							</span>
						)}
					</div>

					{event.startTime && (
						<p className="text-xs text-[#8a7d6c] mb-1.5">
							<span className="mr-1.5 opacity-50">◷</span>
							{formatTime(event.startTime)}
							{event.endTime && <> – {formatTime(event.endTime)}</>}
						</p>
					)}

					{event.venueName && (
						<p className="text-xs text-[#8a7d6c] flex items-center gap-1.5 mb-1.5">
							<span className="text-[#C9A684]/60 text-[0.6rem]">✦</span>
							{event.mapLink ? (
								<a
									href={event.mapLink}
									target="_blank"
									rel="noopener noreferrer"
									className="text-[#C9A684] hover:text-[#a8865e] transition-colors hover:underline underline-offset-2"
								>
									{event.venueName}
								</a>
							) : (
								<span>{event.venueName}</span>
							)}
						</p>
					)}

					{event.notes && (
						<p className="text-sm text-[#5a5048] leading-relaxed mt-3 italic">{event.notes}</p>
					)}
				</div>
			</div>
			{connector && (
				<div className="flex justify-center py-1">
					<div className="w-px h-5 bg-[#C9A684]/25" />
				</div>
			)}
		</div>
	);
}

// ── Day config ────────────────────────────────────────────────────────────────

type DayConfig = {
	date: string;
	dayNum: string;
	dayName: string;
	themeLabel: string;
	freeDay?: boolean;
	isWedding?: boolean;
};

const days: DayConfig[] = [
	{ date: "2027-06-10", dayNum: "Day One",   dayName: "Thursday, June 10", themeLabel: "Welcome Evening" },
	{ date: "2027-06-11", dayNum: "Day Two",   dayName: "Friday, June 11",   themeLabel: "Your Tuscany Day", freeDay: true },
	{ date: "2027-06-12", dayNum: "Day Three", dayName: "Saturday, June 12", themeLabel: "The Wedding",      isWedding: true },
	{ date: "2027-06-13", dayNum: "Day Four",  dayName: "Sunday, June 13",   themeLabel: "Farewell Morning" },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ItineraryPage() {
	const eventsByDay = days.map((day) => ({
		...day,
		events: itineraryEvents.filter((e) => e.date === day.date),
	}));

	return (
		<div className="bg-[#FAF7F2] min-h-screen">

			{/* Hero */}
			<div className="pt-24 pb-2">
				<div className="max-w-[720px] mx-auto px-6 sm:px-10 text-center">
					<FadeUp>
						<SectionLabel>Tuscany · June 2027</SectionLabel>
						<h1 className="font-header text-3xl sm:text-4xl text-[#3F3A36] mb-4">
							Weekend Itinerary
						</h1>
						<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed max-w-[480px] mx-auto">
							Four days of celebration, exploration, and time together in the heart of Tuscany.
						</p>
					</FadeUp>
				</div>
			</div>

			<div className="max-w-[720px] mx-auto px-6 sm:px-10">

				{eventsByDay.map((day, i) => (
					<div key={day.date}>
						{i > 0 && <BotanicalRule />}

						<FadeUp>
							{/* Day header */}
							<div className="mb-8">
								<p className="text-[0.6rem] uppercase tracking-[0.46em] text-[#8a7d6c] mb-1">
									{day.dayNum}
								</p>
								<h2 className={`font-header text-2xl sm:text-3xl mb-1 ${day.isWedding ? "text-[#3F3A36]" : "text-[#3F3A36]"}`}>
									{day.dayName}
								</h2>
								<p className={`text-sm italic ${day.isWedding ? "text-[#C9A684] font-medium" : "text-[#8a7d6c]"}`}>
									{day.themeLabel}
								</p>
								<div className="mt-4 h-px bg-gradient-to-r from-[#C9A684]/30 via-[#C9A684]/10 to-transparent" />
							</div>

							{/* Free day */}
							{day.freeDay && day.events[0] && (
								<div className="bg-[#BFCBB2]/10 border border-[#BFCBB2]/40 rounded-xl p-6 sm:p-8">
									<p className="text-[0.62rem] uppercase tracking-[0.46em] text-[#8a7d6c] mb-3">
										<span style={{ letterSpacing: 0, textTransform: "none", color: "#BFCBB2", marginRight: "8px", fontSize: "0.8rem" }}>✈</span>
										Free Day
									</p>
									<h3 className="font-header text-xl text-[#3F3A36] mb-3">{day.events[0].title}</h3>
									<p className="text-sm text-[#5a5048] leading-relaxed italic mb-5">
										{day.events[0].notes}
									</p>
									<Link
										href="/travel"
										className="text-xs text-[#C9A684] hover:text-[#a8865e] transition-colors"
									>
										Travel tips &amp; suggestions →
									</Link>
								</div>
							)}

							{/* Wedding day */}
							{day.isWedding && day.events.length > 0 && (
								<div
									className="rounded-2xl border border-[#E8C4B8]/50 p-6 sm:p-8"
									style={{ background: "linear-gradient(135deg, #FDF0EC 0%, #FBF7EE 100%)" }}
								>
									<p className="text-[0.62rem] uppercase tracking-[0.46em] text-[#C9A684] mb-2 text-center">
										<span style={{ letterSpacing: 0, textTransform: "none", marginRight: "6px" }}>✿</span>
										The Main Event
										<span style={{ letterSpacing: 0, textTransform: "none", marginLeft: "6px" }}>✿</span>
									</p>
									<p className="text-center mb-6">
										<Link href="/attire" className="text-xs text-[#8a7d6c] hover:text-[#C9A684] transition-colors">
											Indo-Western Black Tie &nbsp;·&nbsp; <span className="underline underline-offset-2">Attire Guide →</span>
										</Link>
									</p>
									{day.events.map((event, idx) => (
										<EventCard
											key={event.id}
											event={event}
											connector={idx < day.events.length - 1}
										/>
									))}
								</div>
							)}

							{/* Regular day (Welcome Party, Farewell Brunch) */}
							{!day.freeDay && !day.isWedding && day.events.length > 0 && (
								<div className="space-y-3">
									{day.events.map((event) => (
										<EventCard key={event.id} event={event} />
									))}
								</div>
							)}
						</FadeUp>
					</div>
				))}

				<BotanicalRule />

				{/* Footer */}
				<FadeUp>
					<div className="text-center pb-14">
						<p className="text-sm text-[#5a5048] mb-2">Questions about the weekend?</p>
						<a
							href="mailto:hello@jeslinandmyles.com"
							className="text-sm text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2"
						>
							hello@jeslinandmyles.com
						</a>
					</div>
				</FadeUp>

			</div>
		</div>
	);
}
