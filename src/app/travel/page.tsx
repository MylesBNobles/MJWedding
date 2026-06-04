"use client";

import { useState } from "react";
import Link from "next/link";
import { ItalyMap } from "@/components/ItalyMap";
import { FadeUp } from "@/components/FadeUp";
import { Toast, useToast } from "@/components";
import { travelInfo } from "@/lib/mockData";

// ── Decorative components (matching save-the-date aesthetic) ─────────────────

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

function LetterHeading({ children }: { children: React.ReactNode }) {
	return <h2 className="font-header text-2xl sm:text-3xl text-[#3F3A36] mb-6">{children}</h2>;
}

// ── Weekend timeline data ─────────────────────────────────────────────────────

const weekendDays = [
	{ date: "Thu · Jun 10", icon: "✦", title: "Welcome Party", note: "Evening celebration to kick off the weekend" },
	{ date: "Fri · Jun 11", icon: "✈", title: "Explore Tuscany", note: "A free day to rest and wander" },
	{ date: "Sat · Jun 12", icon: "♡", title: "Wedding Day", note: "Ceremony & Reception at Villa Di Geggiano" },
	{ date: "Sun · Jun 13", icon: "☀", title: "Farewell Brunch", note: "A relaxed morning to say goodbye" },
];

// ── Airport step-by-step directions ──────────────────────────────────────────

const airportDetails: Record<string, {
	summary: string;
	options: { title: string; steps: string[]; links?: { label: string; href: string }[] }[];
}> = {
	FLR: {
		summary: "Florence is the closest and easiest airport for reaching the venue. Estimated travel time: ~1 hour 15 minutes.",
		options: [
			{
				title: "Option 1: Train (Recommended)",
				steps: [
					"Take the T2 tram (Vespucci line) from Florence Airport to Firenze Santa Maria Novella Station (~20 min).",
					"From Firenze SMN, take a regional train to Siena Station (~1 hour; trains roughly hourly).",
					"From Siena station, take a taxi to your hotel or the venue (~15 min).",
				],
				links: [
					{ label: "Tram info", href: "https://www.gestramvia.it/" },
					{ label: "Trenitalia", href: "https://www.trenitalia.com/" },
				],
			},
			{
				title: "Option 2: Taxi / Private Transfer",
				steps: [
					"Direct taxi or private car from Florence Airport to Siena (~1 hour 15 min).",
					"Estimated cost: €150–€180. Book in advance for the best rates.",
				],
				links: [{ label: "Florence taxi info", href: "https://www.4390.it/" }],
			},
		],
	},
	PSA: {
		summary: "Pisa is a convenient alternative with more international flights. Estimated travel time: ~1 hour 45 minutes.",
		options: [
			{
				title: "Option 1: Train (Recommended)",
				steps: [
					"Take the Pisamover shuttle from the airport to Pisa Centrale (~5 min).",
					"Train from Pisa Centrale to Firenze Santa Maria Novella (~1 hour).",
					"From Firenze SMN, take a regional train to Siena (~1 hour).",
					"Taxi from Siena station to hotel or venue (~15 min).",
				],
				links: [
					{ label: "Pisamover", href: "https://www.pisamover.com/" },
					{ label: "Trenitalia", href: "https://www.trenitalia.com/" },
				],
			},
			{
				title: "Option 2: Taxi / Private Transfer",
				steps: [
					"Direct taxi or private car from Pisa Airport to Siena (~1 hour 45 min).",
					"Estimated cost: €180–€220.",
				],
				links: [{ label: "Pisa taxi info", href: "https://www.cotapi.it/" }],
			},
		],
	},
	FCO: {
		summary: "Rome Fiumicino is the furthest option but useful for long-haul flights. Estimated travel time: ~3 hours.",
		options: [
			{
				title: "Option 1: Train (Recommended)",
				steps: [
					"Take the Leonardo Express from FCO to Roma Termini (~30 min).",
					"High-speed train from Roma Termini to Firenze SMN (~1h 30min).",
					"Regional train from Firenze SMN to Siena (~1 hour).",
					"Taxi from Siena station to hotel or venue (~15 min).",
				],
				links: [
					{ label: "Leonardo Express", href: "https://www.trenitalia.com/en/services/leonardo-express.html" },
					{ label: "Trenitalia", href: "https://www.trenitalia.com/" },
					{ label: "Italo", href: "https://www.italotreno.it/" },
				],
			},
			{
				title: "Option 2: Taxi / Private Transfer",
				steps: [
					"Direct private transfer from Rome FCO to Siena (~3 hours).",
					"Estimated cost: €300–€400.",
				],
				links: [{ label: "Rome taxi info", href: "https://www.3570.it/" }],
			},
		],
	},
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TravelPage() {
	const { toast, showToast, hideToast } = useToast();
	const [expanded, setExpanded] = useState<string | null>(null);

	const copyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		showToast("Link copied");
	};

	return (
		<div className="bg-[#FAF7F2] min-h-screen">

			{/* ── Hero ── */}
			<div className="pt-24 pb-2">
				<div className="max-w-[720px] mx-auto px-6 sm:px-10 text-center">
					<FadeUp>
						<SectionLabel>Travel · Planning</SectionLabel>
						<h1 className="font-header text-3xl sm:text-4xl text-[#3F3A36] mb-4">
							Getting to Tuscany
						</h1>
						<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed mb-10 max-w-[500px] mx-auto">
							Everything you need to plan your journey to Villa Di Geggiano — from flights and airports to hotels and the complimentary shuttle.
						</p>
					</FadeUp>
					<FadeUp delay={120}>
						<ItalyMap />
					</FadeUp>
				</div>
			</div>

			<div className="max-w-[720px] mx-auto px-6 sm:px-10">

				<BotanicalRule />

				{/* ── When to Travel ── */}
				<FadeUp>
					<SectionLabel>When to Travel</SectionLabel>
					<LetterHeading>Arrival & Departure</LetterHeading>
					<p className="text-sm text-[#5a5048] leading-relaxed mb-7">
						Since this is a destination celebration, we recommend giving yourself a day or two to settle in before the festivities begin. Flights tend to open earlier than hotels, so feel free to start watching fares now — and see our accommodations note below for hotel timing.
					</p>
					<div className="grid sm:grid-cols-2 gap-5">
						{/* Arrival */}
						<div className="bg-[#FBF7EE] border border-[#C9A684]/25 rounded-xl p-6">
							<div className="flex items-center gap-2 mb-5">
								<span className="text-base text-[#C9A684]">✈</span>
								<p className="text-xs uppercase tracking-[0.36em] text-[#C9A684]">Arriving</p>
							</div>
							<div className="space-y-4">
								<div className="border-l-2 border-[#BFCBB2] pl-4">
									<p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#8a7d6c] mb-1">Ideal</p>
									<p className="text-sm font-medium text-[#3F3A36]">{travelInfo.arrivalWindow.ideal}</p>
								</div>
								<div className="border-l-2 border-[#C9A684]/40 pl-4">
									<p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#8a7d6c] mb-1">Latest</p>
									<p className="text-sm text-[#3F3A36]">{travelInfo.arrivalWindow.latest}</p>
									<p className="text-xs text-[#8a7d6c] italic mt-1">Welcome Party is Thursday evening</p>
								</div>
							</div>
						</div>
						{/* Departure */}
						<div className="bg-[#FBF7EE] border border-[#C9A684]/25 rounded-xl p-6">
							<div className="flex items-center gap-2 mb-5">
								<span className="text-base text-[#C9A684]">☀</span>
								<p className="text-xs uppercase tracking-[0.36em] text-[#C9A684]">Departing</p>
							</div>
							<div className="space-y-4">
								<div className="border-l-2 border-[#BFCBB2] pl-4">
									<p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#8a7d6c] mb-1">Ideal</p>
									<p className="text-sm font-medium text-[#3F3A36]">{travelInfo.departureWindow.ideal}</p>
								</div>
								<div className="border-l-2 border-[#C9A684]/40 pl-4">
									<p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#8a7d6c] mb-1">Earliest</p>
									<p className="text-sm text-[#3F3A36]">{travelInfo.departureWindow.earliest}</p>
									<p className="text-xs text-[#8a7d6c] italic mt-1">Farewell Brunch is Sunday morning</p>
								</div>
							</div>
						</div>
					</div>
				</FadeUp>

				<BotanicalRule />

				{/* ── Airports ── */}
				<FadeUp>
					<SectionLabel>Getting Here</SectionLabel>
					<LetterHeading>Airports</LetterHeading>
					<p className="text-sm text-[#5a5048] leading-relaxed mb-7">
						Florence and Pisa are your best bets for convenience. Rome can offer cheaper long-haul connections for some travelers.
					</p>
					<div className="space-y-3">
						{travelInfo.airports.map((airport) => {
							const isOpen = expanded === airport.code;
							const detail = airportDetails[airport.code];
							return (
								<div
									key={airport.code}
									className="bg-[#FBF7EE] border border-[#C9A684]/20 rounded-xl overflow-hidden transition-shadow hover:shadow-sm"
								>
									<button
										onClick={() => setExpanded(isOpen ? null : airport.code)}
										className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
									>
										<div className="flex items-center gap-4 min-w-0">
											<span className="flex-shrink-0 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white bg-[#C9A684] px-2 py-1 rounded">
												{airport.code}
											</span>
											<div className="min-w-0">
												<p className="font-header text-[#3F3A36] text-base truncate">{airport.name}</p>
												<p className="text-xs text-[#8a7d6c] mt-0.5 italic">{airport.driveTime} to venue</p>
											</div>
										</div>
										<div className="flex items-center gap-3 flex-shrink-0">
											{airport.recommended && (
												<span className="text-[0.58rem] uppercase tracking-[0.28em] text-[#C9A684] hidden sm:block">
													Recommended
												</span>
											)}
											<svg
												className={`w-5 h-5 text-[#C9A684] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
												viewBox="0 0 20 20" fill="none" aria-hidden
											>
												<path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										</div>
									</button>

									{isOpen && detail && (
										<div className="px-6 pb-6 border-t border-[#C9A684]/15">
											<p className="text-sm text-[#5a5048] leading-relaxed mt-4 mb-5 italic">{detail.summary}</p>
											<div className="space-y-5">
												{detail.options.map((opt, idx) => (
													<div key={idx}>
														<p className="text-xs uppercase tracking-[0.28em] text-[#C9A684] mb-3">{opt.title}</p>
														<ol className="space-y-2">
															{opt.steps.map((step, sidx) => (
																<li key={sidx} className="flex gap-3 text-sm text-[#5a5048] leading-relaxed">
																	<span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#C9A684]/15 text-[#C9A684] text-[0.62rem] flex items-center justify-center font-medium mt-0.5">
																		{sidx + 1}
																	</span>
																	{step}
																</li>
															))}
														</ol>
														{opt.links && (
															<div className="flex flex-wrap gap-3 mt-3 pl-8">
																{opt.links.map((lnk, lidx) => (
																	<a key={lidx} href={lnk.href} target="_blank" rel="noreferrer"
																		className="text-xs text-[#C9A684] hover:text-[#a8865e] underline underline-offset-2 transition-colors">
																		{lnk.label} →
																	</a>
																))}
															</div>
														)}
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</FadeUp>

				<BotanicalRule />

				{/* ── Weekend Timeline ── */}
				<FadeUp>
					<SectionLabel>The Wedding Weekend</SectionLabel>
					<LetterHeading>June 10 – 13, 2027</LetterHeading>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						{weekendDays.map((day) => (
							<div key={day.date} className="bg-[#FBF7EE] border border-[#C9A684]/20 rounded-xl p-4 text-center">
								<p className="text-[0.55rem] uppercase tracking-[0.28em] text-[#8a7d6c] mb-2">{day.date}</p>
								<div className="text-2xl text-[#C9A684] mb-2" aria-hidden>{day.icon}</div>
								<p className="font-header text-[#3F3A36] text-sm mb-1">{day.title}</p>
								<p className="text-[0.65rem] text-[#8a7d6c] leading-snug italic">{day.note}</p>
							</div>
						))}
					</div>
				</FadeUp>

				<BotanicalRule />

				{/* ── Where to Stay ── */}
				<FadeUp>
					<SectionLabel>Where to Stay</SectionLabel>
					<LetterHeading>Accommodations</LetterHeading>
					<p className="text-sm text-[#5a5048] leading-relaxed mb-6">
						Stay wherever feels right for you — we just love Siena&rsquo;s historic center as a base. It puts you close to restaurants, sights, and the shuttle pickup, but anywhere that&rsquo;s convenient for your travel works perfectly. The hotels below are ones we love.
					</p>

					{/* Booking window callout */}
					<div className="mb-7 rounded-xl border border-[#C9A684]/35 bg-[#FBF7EE] px-6 py-5 flex gap-4 items-start">
						<span className="text-2xl mt-0.5 shrink-0">📅</span>
						<div>
							<p className="font-header text-[#3F3A36] text-base mb-1">A note on booking timing</p>
							<p className="text-sm text-[#5a5048] leading-relaxed">
								Most boutique hotels in Siena and the Tuscan countryside don&rsquo;t open reservations until <strong className="text-[#3F3A36]">after September 2026</strong> — typically 6–9 months before the wedding. No need to stress about rooms just yet. Check back in the fall and you&rsquo;ll have plenty of great options.
							</p>
						</div>
					</div>

					<div className="space-y-4 mb-6">
						{travelInfo.hotelRecommendations.map((hotel) => (
							<div key={hotel.id} className="bg-[#FBF7EE] border border-[#C9A684]/20 rounded-xl p-6">
								<div className="flex items-start justify-between gap-3 mb-2">
									<h3 className="font-header text-[#3F3A36] text-lg">{hotel.name}</h3>
									<span className="flex-shrink-0 text-[0.58rem] font-medium uppercase tracking-[0.2em] text-[#C9A684] border border-[#C9A684]/40 px-2 py-0.5 rounded">
										{hotel.priceLevel}
									</span>
								</div>
								<p className="text-sm text-[#5a5048] leading-relaxed mb-4">{hotel.description}</p>
								<div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#8a7d6c] mb-4">
									<span>{hotel.distanceToVenue} to venue</span>
									<span>{hotel.walkToShuttle} to shuttle</span>
								</div>
								{hotel.bookingUrl && (
									<a href={hotel.bookingUrl} target="_blank" rel="noopener noreferrer"
										className="inline-block text-xs text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2">
										View &amp; Book →
									</a>
								)}
							</div>
						))}
					</div>
				</FadeUp>

				<BotanicalRule />

				{/* ── Shuttle callout ── */}
				<FadeUp>
					<div
						className="relative rounded-2xl overflow-hidden border border-[#E8C4B8]/50 px-8 py-10 mb-10"
						style={{ background: "linear-gradient(135deg, #FDF0EC 0%, #FBF7EE 100%)" }}
					>
						{/* Corner florals */}
						<svg className="absolute top-3 left-4 opacity-40" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
							<circle cx="12" cy="8" r="5" fill="#F7D6C1" />
							<circle cx="8" cy="14" r="4" fill="#D6C6E1" />
							<circle cx="18" cy="14" r="4" fill="#BFCBB2" />
							<circle cx="12" cy="20" r="4" fill="#F7D6C1" />
							<circle cx="12" cy="14" r="3.5" fill="#C9A684" fillOpacity="0.6" />
						</svg>
						<svg className="absolute top-3 right-4 opacity-40" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
							<circle cx="36" cy="8" r="5" fill="#F7D6C1" />
							<circle cx="40" cy="14" r="4" fill="#D6C6E1" />
							<circle cx="30" cy="14" r="4" fill="#BFCBB2" />
							<circle cx="36" cy="20" r="4" fill="#F7D6C1" />
							<circle cx="36" cy="14" r="3.5" fill="#C9A684" fillOpacity="0.6" />
						</svg>

						<div className="text-center relative z-10">
							<SectionLabel>Complimentary Service</SectionLabel>
							<h3 className="font-header text-2xl text-[#3F3A36] mb-3">Shuttle Service</h3>
							<p className="text-sm text-[#5a5048] leading-relaxed mb-5 max-w-[460px] mx-auto">
								{travelInfo.shuttleInfo.description}
							</p>
							<div className="inline-block bg-white/60 border border-[#C9A684]/20 rounded-lg px-5 py-3 text-left mb-5">
								<p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#C9A684] mb-1">Pickup Location</p>
								<p className="text-sm font-medium text-[#3F3A36]">{travelInfo.shuttleInfo.pickupLocation}</p>
								<p className="text-xs text-[#8a7d6c] mt-0.5">{travelInfo.shuttleInfo.pickupAddress}</p>
							</div>
							<div className="block">
								<a href={travelInfo.shuttleInfo.mapLink} target="_blank" rel="noopener noreferrer"
									className="inline-block text-xs text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2">
									View on Map →
								</a>
							</div>
						</div>
					</div>
				</FadeUp>

				{/* ── Getting Around ── */}
				<FadeUp>
					<SectionLabel>Getting Around</SectionLabel>
					<LetterHeading>Transportation Options</LetterHeading>
					<div className="space-y-3 mb-4">
						{travelInfo.transport.map((option) => (
							<div key={option.type} className="bg-[#FBF7EE] border border-[#C9A684]/20 rounded-xl px-6 py-4 flex items-start justify-between gap-4">
								<div>
									<div className="flex items-center gap-2 mb-1">
										<p className="font-header text-[#3F3A36] text-base">{option.type}</p>
										{option.recommended && (
											<span className="text-[0.55rem] uppercase tracking-[0.24em] text-[#C9A684]">· Recommended</span>
										)}
									</div>
									<p className="text-sm text-[#5a5048] leading-relaxed">{option.description}</p>
								</div>
							</div>
						))}
					</div>
				</FadeUp>

				<BotanicalRule />

				{/* ── Tips ── */}
				<FadeUp>
					<SectionLabel>Good to Know</SectionLabel>
					<LetterHeading>Tips for Visitors</LetterHeading>
					<div className="space-y-3 mb-10">
						{travelInfo.tips.map((tip, i) => (
							<div key={i} className="flex gap-4 items-start">
								<span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C9A684]/15 text-[#C9A684] text-xs flex items-center justify-center mt-0.5" aria-hidden>
									✦
								</span>
								<p className="text-sm text-[#5a5048] leading-relaxed">{tip}</p>
							</div>
						))}
					</div>
				</FadeUp>

				{/* ── Footer ── */}
				<div className="border-t border-[#C9A684]/20 py-8 flex items-center justify-between gap-4">
					<p className="text-xs text-[#8a7d6c] italic">
						More details coming as we get closer to the date.
					</p>
					<button
						onClick={copyLink}
						className="text-xs text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2 flex-shrink-0"
					>
						Copy page link
					</button>
				</div>

			</div>

			<Toast message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />
		</div>
	);
}
