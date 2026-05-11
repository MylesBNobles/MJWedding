import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SaveTheDateEnvelope } from "@/components/SaveTheDateEnvelope";
import { FlipCountdown } from "@/components/FlipCountdown";
import { ItalyMap } from "@/components/ItalyMap";
import { RSVPButton } from "@/components/RSVPButton";
import { FloatingBotanicals } from "@/components/FloatingBotanicals";
import { AnimatedSignature } from "@/components/AnimatedSignature";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ScrollHint } from "@/components/ScrollHint";
import { ScrollLock } from "@/components/ScrollLock";
import { FadeUp } from "@/components/FadeUp";
import { weddingDetails, itineraryEvents, travelInfo, attireSections } from "@/lib/mockData";

export const metadata: Metadata = {
	title: "Save the Date — Jeslin & Myles",
	description: `Save the date for the wedding of Jeslin & Myles, ${weddingDetails.date}, ${weddingDetails.venue}, ${weddingDetails.location}.`,
	openGraph: {
		title: "Save the Date — Jeslin & Myles",
		description: `${weddingDetails.date} · ${weddingDetails.venue} · ${weddingDetails.location}`,
		images: [{ url: "/images/MJWeddingPic1.jpeg", width: 1200, height: 630, alt: "Jeslin & Myles" }],
		type: "website",
	},
};

const colorPalette = [
	{ name: "Sky Blue", hex: "#CFE8F7" },
	{ name: "Butter Yellow", hex: "#F6E7B2" },
	{ name: "Soft Peach", hex: "#F7D6C1" },
	{ name: "Soft Lavender", hex: "#D6C6E1" },
	{ name: "Sage Green", hex: "#BFCBB2" },
];

const dayIcons: Record<string, string> = {
	"2027-06-11": "✈",
	"2027-06-12": "✦",
	"2027-06-13": "☀",
};

// Botanical SVG divider — replaces the plain ✦ rule
function BotanicalRule() {
	return (
		<div className="flex items-center justify-center my-14" aria-hidden>
			<svg viewBox="0 0 320 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm">
				{/* Gold lines */}
				<line x1="0" y1="16" x2="108" y2="16" stroke="#C9A684" strokeWidth="0.6" strokeOpacity="0.28" />
				<line x1="212" y1="16" x2="320" y2="16" stroke="#C9A684" strokeWidth="0.6" strokeOpacity="0.28" />
				{/* Left olive sprig */}
				<path d="M110,16 L133,16" stroke="#BFCBB2" strokeWidth="0.9" strokeOpacity="0.7" />
				<ellipse cx="116" cy="12" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(-25 116 12)" />
				<ellipse cx="122" cy="20" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(25 122 20)" />
				<ellipse cx="128" cy="12" rx="4.5" ry="2.5" fill="#BFCBB2" fillOpacity="0.65" transform="rotate(-25 128 12)" />
				{/* Center 6-petal flower */}
				<circle cx="160" cy="9"    r="4" fill="#F7D6C1" fillOpacity="0.78" />
				<circle cx="166" cy="12.5" r="4" fill="#F7D6C1" fillOpacity="0.78" />
				<circle cx="166" cy="19.5" r="4" fill="#F7D6C1" fillOpacity="0.78" />
				<circle cx="160" cy="23"   r="4" fill="#F7D6C1" fillOpacity="0.78" />
				<circle cx="154" cy="19.5" r="4" fill="#F7D6C1" fillOpacity="0.78" />
				<circle cx="154" cy="12.5" r="4" fill="#F7D6C1" fillOpacity="0.78" />
				<circle cx="160" cy="16"   r="5" fill="#C9A684" fillOpacity="0.4" />
				<circle cx="160" cy="16"   r="2.5" fill="#C9A684" fillOpacity="0.9" />
				{/* Right olive sprig (mirrored) */}
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
	return (
		<h2 className="font-header text-2xl sm:text-3xl text-[#3F3A36] mb-6">
			{children}
		</h2>
	);
}

// Flower-shaped color swatch for the attire palette
function FlowerSwatch({ name, hex }: { name: string; hex: string }) {
	const petals = [0, 72, 144, 216, 288].map((deg) => {
		const rad = (deg - 90) * Math.PI / 180;
		return { cx: 30 + 13 * Math.cos(rad), cy: 30 + 13 * Math.sin(rad) };
	});
	return (
		<div className="flex flex-col items-center">
			<svg viewBox="0 0 60 60" width="52" height="52" aria-hidden>
				{petals.map((p, i) => (
					<circle key={i} cx={p.cx} cy={p.cy} r="11" fill={hex} fillOpacity="0.88" />
				))}
				<circle cx="30" cy="30" r="9" fill={hex} />
				<circle cx="30" cy="30" r="4.5" fill="white" fillOpacity="0.4" />
			</svg>
			<span className="mt-2 text-[0.6rem] text-[#8a7d6c] text-center leading-tight">{name}</span>
		</div>
	);
}

const days = [
	{ date: "2027-06-11", label: "Friday, June 11" },
	{ date: "2027-06-12", label: "Saturday, June 12" },
	{ date: "2027-06-13", label: "Sunday, June 13" },
];

function formatTime(t: string) {
	const [h, m] = t.split(":").map(Number);
	const ampm = h >= 12 ? "PM" : "AM";
	const hour = h % 12 || 12;
	return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default function SaveTheDatePage() {
	return (
		<>
		<div className="bg-[#FAF7F2]">
			<SaveTheDateEnvelope
				coupleNames="Jeslin & Myles"
				dateLine={weddingDetails.date}
				venue={weddingDetails.venue}
				location={weddingDetails.location}
			/>

			{/* Parchment letter */}
			<div className="relative z-10" style={{ marginTop: "-56px" }}>
				{/* Deckled top edge */}
				<svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full block" aria-hidden>
					<path
						d="M0,80 L0,52 C22,44 34,60 56,52 C78,44 88,62 112,54 C136,46 146,34 168,44 C190,54 202,38 224,48 C246,58 258,40 280,50 C302,60 314,42 338,52 C362,62 372,46 396,54 C420,62 430,44 454,52 C478,60 488,42 512,50 C536,58 548,38 572,48 C596,58 606,36 630,46 C654,56 664,32 688,44 C712,56 722,28 748,40 C774,52 784,24 810,36 C836,48 846,20 872,32 C898,44 908,16 934,28 C960,40 970,12 996,24 C1022,36 1032,8 1058,20 C1084,32 1094,6 1120,18 C1146,30 1156,4 1182,14 C1208,24 1218,2 1244,12 C1270,22 1280,2 1306,10 C1332,18 1342,4 1368,12 C1380,16 1400,6 1420,10 C1428,12 1436,8 1440,10 L1440,80 Z"
						fill="#FBF7EE"
					/>
				</svg>

				<div className="bg-[#FBF7EE] relative">
					<FloatingBotanicals />
					<div className="max-w-[720px] mx-auto px-6 sm:px-10">

						{/* Flip-board countdown — Jeslin loves this section */}
						<FlipCountdown />

						<BotanicalRule />

						{/* Opening letter */}
						<FadeUp>
							<div className="text-center mb-2">
								<SectionLabel>A Letter From Us</SectionLabel>
							</div>
							<div className="text-center max-w-[560px] mx-auto">
								<p className="font-header italic text-[#5a5048] text-lg sm:text-xl leading-relaxed mb-6">
									Dear Friends &amp; Family,
								</p>
								<p className="text-[#5a5048] leading-relaxed mb-5 text-sm sm:text-base">
									We are overjoyed to share that we&rsquo;re getting married in the heart of Tuscany, Italy — and we would love nothing more than to celebrate this moment with you. Below you&rsquo;ll find everything you need to start planning your journey to Villa Di Geggiano.
								</p>
								<p className="text-[#5a5048] leading-relaxed mb-10 text-sm sm:text-base">
									Since this is a destination celebration, we wanted to give you as much time as possible to make travel arrangements. Formal invitations with full RSVP details will follow closer to the date.
								</p>
								<p className="font-header italic text-[#8a7d6c] text-base mb-1">
									With so much love,
								</p>
								<AnimatedSignature />

								{/* Polaroid photo */}
								<div className="mt-10 flex justify-center">
									<div
										style={{
											background: "white",
											padding: "10px 10px 32px",
											boxShadow: "0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)",
											transform: "rotate(-2.5deg)",
											display: "inline-block",
											maxWidth: 220,
										}}
									>
										<Image
											src="/images/ProposalBoatPic.JPG"
											alt="Jeslin & Myles proposal"
											width={200}
											height={200}
											style={{ display: "block", width: "100%", height: "auto", objectFit: "cover", aspectRatio: "1/1" }}
										/>
										<p
											style={{
												fontFamily: "var(--font-cursive)",
												fontSize: "1.1rem",
												color: "#8a7d6c",
												textAlign: "center",
												marginTop: "6px",
												lineHeight: 1.2,
											}}
										>
											the beginning ♡
										</p>
									</div>
								</div>
							</div>
						</FadeUp>

						{/* RSVP nudge — early, prominent, new tab */}
						<FadeUp delay={100}>
							<div
								className="relative my-12 rounded-2xl overflow-hidden border border-[#E8C4B8]/50 text-center px-8 py-10"
								style={{ background: "linear-gradient(135deg, #FDF0EC 0%, #FBF7EE 100%)" }}
							>
								{/* Decorative corner florals */}
								<svg className="absolute top-3 left-4 opacity-40" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
									<circle cx="12" cy="8"  r="5" fill="#F7D6C1" />
									<circle cx="8"  cy="14" r="4" fill="#D6C6E1" />
									<circle cx="18" cy="14" r="4" fill="#BFCBB2" />
									<circle cx="12" cy="20" r="4" fill="#F7D6C1" />
									<circle cx="12" cy="14" r="3.5" fill="#C9A684" fillOpacity="0.6" />
								</svg>
								<svg className="absolute top-3 right-4 opacity-40" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
									<circle cx="36" cy="8"  r="5" fill="#F7D6C1" />
									<circle cx="40" cy="14" r="4" fill="#D6C6E1" />
									<circle cx="30" cy="14" r="4" fill="#BFCBB2" />
									<circle cx="36" cy="20" r="4" fill="#F7D6C1" />
									<circle cx="36" cy="14" r="3.5" fill="#C9A684" fillOpacity="0.6" />
								</svg>

								<p className="text-[0.62rem] uppercase tracking-[0.46em] text-[#C9A684] mb-3">
									<span style={{ letterSpacing: 0, textTransform: "none", marginRight: "6px" }}>✿</span>
									Tuscany is calling
									<span style={{ letterSpacing: 0, textTransform: "none", marginLeft: "6px" }}>✿</span>
								</p>
								<h3 className="font-header text-2xl sm:text-3xl text-[#3F3A36] mb-3">
									Will you join us?
								</h3>
								<p className="text-sm text-[#5a5048] leading-relaxed mb-7 max-w-[400px] mx-auto">
									As a destination celebration, we&rsquo;d love to know you&rsquo;re coming as early as possible — it helps us plan the most magical weekend for everyone who travels to be with us.
								</p>
								<RSVPButton />
								<p className="text-[0.65rem] text-[#8a7d6c] mt-4 italic">
									Formal invitations to follow — RSVP early secures your spot.
								</p>

								{/* Tuscan rolling hills at card bottom */}
								<svg
									viewBox="0 0 480 60"
									preserveAspectRatio="none"
									className="absolute bottom-0 inset-x-0 w-full"
									aria-hidden
								>
									<path
										d="M0,60 L0,40 C40,28 80,44 120,36 C160,28 200,16 240,22 C280,28 320,42 360,36 C400,30 440,18 480,26 L480,60 Z"
										fill="#4A5E3A"
										fillOpacity="0.07"
									/>
									<path
										d="M0,60 L0,50 C50,38 100,52 150,46 C200,40 250,30 300,38 C350,46 400,36 480,42 L480,60 Z"
										fill="#C9A684"
										fillOpacity="0.09"
									/>
								</svg>
							</div>
						</FadeUp>

						<BotanicalRule />

						{/* Weekend Timeline */}
						<FadeUp>
							<div>
								<SectionLabel>The Wedding Weekend</SectionLabel>
								<LetterHeading>June 11 – 13, 2027</LetterHeading>
								<div className="space-y-10">
									{days.map(({ date, label }) => {
										const events = itineraryEvents.filter((e) => e.date === date);
										if (!events.length) return null;
										return (
											<div key={date}>
												<p className="text-xs uppercase tracking-[0.36em] text-[#C9A684] mb-4 font-medium flex items-center gap-2">
													<span style={{ letterSpacing: 0, textTransform: "none", fontSize: "0.95rem" }}>
														{dayIcons[date]}
													</span>
													{label}
												</p>
												<div className="space-y-4">
													{events.map((event) => (
														<div key={event.id} className="flex gap-5 items-start border-l-2 border-[#C9A684]/30 pl-5">
															<div className="flex-1">
																<div className="flex flex-wrap items-baseline gap-2 mb-1">
																	<span className="font-header text-[#3F3A36] text-base sm:text-lg">{event.title}</span>
																	{event.dressCode && (
																		<span className="text-[0.6rem] uppercase tracking-[0.3em] text-[#8a7d6c] border border-[#C9A684]/40 rounded-full px-2 py-0.5">
																			{event.dressCode}
																		</span>
																	)}
																</div>
																<p className="text-xs text-[#8a7d6c] mb-1">
																	{formatTime(event.startTime)}
																	{event.endTime && ` – ${formatTime(event.endTime)}`}
																	{event.venueName && ` · ${event.venueName}`}
																</p>
																{event.notes && (
																	<p className="text-sm text-[#5a5048] italic">{event.notes}</p>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										);
									})}
								</div>
								<p className="mt-8 text-sm text-[#8a7d6c] italic">
									Full schedule and arrival details will be included with your formal invitation.
								</p>
							</div>
						</FadeUp>

						<BotanicalRule />

						{/* Getting There */}
						<FadeUp>
							<div>
								<SectionLabel>Getting There</SectionLabel>
								<LetterHeading>Flying to Tuscany</LetterHeading>
								<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed mb-6">
									We recommend flying into Florence or Pisa for the most convenient journey to Villa Di Geggiano.
								</p>

								<ItalyMap />

								<div className="grid sm:grid-cols-2 gap-4 mb-8 mt-6">
									{travelInfo.airports.filter(a => a.recommended).map((airport) => (
										<div key={airport.code} className="bg-[#FAF7F2] rounded-lg p-5 border border-[#C9A684]/20">
											<div className="flex items-center justify-between mb-1">
												<span className="font-header text-[#3F3A36] text-base">{airport.name}</span>
												<span className="text-xs font-medium text-[#C9A684] bg-[#C9A684]/10 px-2 py-0.5 rounded-full">{airport.code}</span>
											</div>
											<p className="text-sm text-[#8a7d6c]">{airport.driveTime} to venue</p>
										</div>
									))}
								</div>

								<div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
									<div>
										<p className="text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-2">Ideal Arrival</p>
										<p className="text-[#3F3A36] font-medium">{travelInfo.arrivalWindow.ideal}</p>
										<p className="text-[#8a7d6c] mt-1">Latest: {travelInfo.arrivalWindow.latest}</p>
									</div>
									<div>
										<p className="text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-2">Departure</p>
										<p className="text-[#3F3A36] font-medium">{travelInfo.departureWindow.ideal}</p>
										<p className="text-[#8a7d6c] mt-1">Earliest: {travelInfo.departureWindow.earliest}</p>
									</div>
								</div>

								<div className="bg-[#FAF7F2] rounded-lg p-5 border border-[#C9A684]/20">
									<p className="text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-2">Complimentary Shuttle</p>
									<p className="text-sm text-[#5a5048] leading-relaxed">{travelInfo.shuttleInfo.description}</p>
									<p className="text-xs text-[#8a7d6c] mt-2">
										Pickup: {travelInfo.shuttleInfo.pickupLocation} · {travelInfo.shuttleInfo.pickupAddress}
									</p>
								</div>
							</div>
						</FadeUp>

						<BotanicalRule />

						{/* Where to Stay */}
						<FadeUp>
							<div>
								<SectionLabel>Where to Stay</SectionLabel>
								<LetterHeading>Accommodations</LetterHeading>

								<div className="relative bg-[#C9A684]/10 border border-[#C9A684]/30 rounded-lg p-6 mb-8 overflow-hidden">
									{/* Rolling hills watermark */}
									<svg
										viewBox="0 0 480 80"
										preserveAspectRatio="none"
										className="absolute bottom-0 inset-x-0 w-full pointer-events-none"
										aria-hidden
									>
										<path
											d="M0,80 L0,55 C60,40 120,60 180,50 C240,40 300,25 360,38 C420,51 450,38 480,44 L480,80 Z"
											fill="#4A5E3A"
											fillOpacity="0.06"
										/>
										<path
											d="M0,80 L0,65 C80,52 160,68 240,60 C320,52 400,42 480,54 L480,80 Z"
											fill="#C9A684"
											fillOpacity="0.07"
										/>
									</svg>
									<p className="relative text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-2">Room Block</p>
									<p className="font-header text-[#3F3A36] text-lg mb-1">{travelInfo.hotelBlock.name}</p>
									<p className="text-sm text-[#5a5048] mb-3">
										We&rsquo;ve reserved a room block at a discounted rate. Use code{" "}
										<span className="font-medium text-[#3F3A36] bg-[#C9A684]/15 px-1.5 py-0.5 rounded font-mono text-xs">
											{travelInfo.hotelBlock.code}
										</span>{" "}
										when booking.
									</p>
									<p className="text-xs text-[#8a7d6c]">Book by {travelInfo.hotelBlock.bookBy} to secure the group rate.</p>
								</div>

								<p className="text-sm text-[#5a5048] mb-6 leading-relaxed">
									Beyond the hotel block, the Siena area and Chianti countryside offer a range of beautiful options — from historic city-center hotels to charming agriturismos.
								</p>

								<div className="space-y-4">
									{travelInfo.hotelRecommendations.map((hotel) => (
										<div key={hotel.id} className="bg-[#FAF7F2] rounded-lg p-5 border border-[#C9A684]/20">
											<div className="flex items-start justify-between gap-3 mb-1">
												<span className="font-header text-[#3F3A36] text-base">{hotel.name}</span>
												<span className="text-xs text-[#8a7d6c] shrink-0">{hotel.priceLevel}</span>
											</div>
											<p className="text-sm text-[#5a5048] mb-2 leading-relaxed">{hotel.description}</p>
											<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8a7d6c]">
												<span>{hotel.distanceToVenue} to venue</span>
												<span>{hotel.walkToShuttle} to shuttle</span>
											</div>
											{hotel.bookingUrl && (
												<a
													href={hotel.bookingUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-block mt-3 text-xs text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2"
												>
													View &amp; Book →
												</a>
											)}
										</div>
									))}
								</div>

								<p className="mt-6 text-sm text-[#8a7d6c] italic">
									Full lodging details and additional recommendations are available on our{" "}
									<Link href="/travel" className="text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2">
										Travel page
									</Link>.
								</p>
							</div>
						</FadeUp>

						<BotanicalRule />

						{/* Attire */}
						<FadeUp>
							<div>
								<SectionLabel>What to Wear</SectionLabel>
								<LetterHeading>Attire</LetterHeading>

								<div className="mb-8">
									<p className="text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-2">Dress Code</p>
									<p className="font-header text-2xl text-[#3F3A36] mb-4">{weddingDetails.dressCode}</p>
									<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed">
										{attireSections[0].description}
									</p>
								</div>

								{/* Cultural note */}
								<div className="bg-[#D6C6E1]/15 border border-[#D6C6E1]/40 rounded-lg p-5 mb-8">
									<p className="text-sm text-[#5a5048] leading-relaxed">
										<span className="font-medium text-[#3F3A36]">Celebrating our cultures —</span>{" "}
										If traditional attire is part of your heritage, we warmly encourage you to wear it. This takes priority over any color suggestions.
									</p>
								</div>

								{/* Color palette — reimagined as flower swatches */}
								<div>
									<p className="text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-3">Suggested Color Palette</p>
									<p className="text-sm text-[#5a5048] mb-6 leading-relaxed">
										If you&rsquo;d like some color inspiration, we&rsquo;re incorporating these light pastels into our celebration. These are suggestions only — wear what makes you feel your best.
									</p>
									<div className="grid grid-cols-5 gap-3">
										{colorPalette.map((color) => (
											<FlowerSwatch key={color.name} name={color.name} hex={color.hex} />
										))}
									</div>
								</div>

								<p className="mt-8 text-sm text-[#8a7d6c] italic">
									Full attire guidance including do&rsquo;s and don&rsquo;ts is on our{" "}
									<Link href="/attire" className="text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2">
										Attire page
									</Link>.
								</p>
							</div>
						</FadeUp>

						<BotanicalRule />

						{/* Gifts */}
						<FadeUp>
							<div>
								<SectionLabel>Gifts</SectionLabel>
								<LetterHeading>Your Presence Is the Greatest Gift</LetterHeading>
								<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed mb-8">
									We truly mean it — the fact that you would travel to Tuscany to celebrate with us means everything. Please do not feel any obligation to bring or send a gift.
								</p>
								<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed mb-8">
									If you would like to honor us with a gift, we are most grateful for contributions toward our honeymoon and life together. We kindly prefer cash gifts, which can be sent via:
								</p>

								<div className="grid sm:grid-cols-3 gap-4 mb-6">
									{[
										{ method: "Zelle", detail: "hello@jeslinandmyles.com", note: "Preferred" },
										{ method: "Venmo", detail: "@JeslinAndMyles", note: null },
										{ method: "Check", detail: "Payable to Myles Nobles", note: "Mailing address on request" },
									].map(({ method, detail, note }) => (
										<div key={method} className="bg-[#FAF7F2] border border-[#C9A684]/20 rounded-lg p-5 text-center">
											<p className="text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-2">{method}</p>
											<p className="text-sm font-medium text-[#3F3A36]">{detail}</p>
											{note && <p className="text-xs text-[#8a7d6c] mt-1">{note}</p>}
										</div>
									))}
								</div>

								<div className="bg-[#C9A684]/10 border border-[#C9A684]/25 rounded-lg p-5 text-center">
									<p className="text-xs uppercase tracking-[0.3em] text-[#C9A684] mb-2">Honeymoon Fund</p>
									<p className="text-sm text-[#5a5048] leading-relaxed">
										We&rsquo;re planning our honeymoon and would be touched if you&rsquo;d like to contribute to our adventures. Any amount is deeply appreciated.
									</p>
									<p className="text-xs text-[#8a7d6c] mt-2">Details coming with the formal invitation.</p>
								</div>
							</div>
						</FadeUp>

						<BotanicalRule />

						{/* Stay Connected */}
						<FadeUp>
							<div className="text-center pb-8">
								<SectionLabel>Stay Connected</SectionLabel>
								<LetterHeading>Visit Our Wedding Website</LetterHeading>
								<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed mb-8 max-w-[480px] mx-auto">
									Our full wedding website has everything — travel details, our story, the itinerary, attire guidance, and more. We&rsquo;ll keep it updated as the date approaches.
								</p>

								<div className="grid sm:grid-cols-3 gap-3 mb-10 text-left">
									{[
										{ href: "/story", label: "Our Story", blurb: "How we got here." },
										{ href: "/travel", label: "Travel & Hotels", blurb: "Getting to Tuscany." },
										{ href: "/itinerary", label: "Itinerary", blurb: "The full weekend." },
										{ href: "/attire", label: "Attire", blurb: "What to wear." },
										{ href: "/faq", label: "FAQ", blurb: "Common questions answered." },
										{ href: "/updates", label: "Updates", blurb: "Latest news from us." },
									].map((link) => (
										<Link
											key={link.href}
											href={link.href}
											className="group bg-white border border-[#EDE6D8] rounded-lg p-4 transition-all hover:border-[#C9A684]/60 hover:shadow-sm"
										>
											<p className="font-header text-[#3F3A36] text-sm mb-0.5 group-hover:text-[#C9A684] transition-colors">
												{link.label}
											</p>
											<p className="text-xs text-[#8a7d6c]">{link.blurb}</p>
										</Link>
									))}
								</div>

								<p className="text-sm text-[#5a5048] mb-2">
									Questions? We&rsquo;re always happy to hear from you.
								</p>
								<a
									href="mailto:hello@jeslinandmyles.com"
									className="text-sm text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2"
								>
									hello@jeslinandmyles.com
								</a>
							</div>
						</FadeUp>
					</div>

					{/* Footer */}
					<footer className="border-t border-[#C9A684]/20 py-14 text-center">
						{/* Botanical heart wreath around J & M */}
						<div className="relative inline-flex flex-col items-center">
							<svg
								viewBox="0 0 200 200"
								width="160"
								height="160"
								aria-hidden
								style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
							>
								{/* Wreath ring made of leaves and small flowers */}
								{Array.from({ length: 18 }, (_, i) => {
									const angle = (360 / 18) * i;
									const rad = (angle * Math.PI) / 180;
									const r = 72;
									const cx = 100 + r * Math.cos(rad);
									const cy = 100 + r * Math.sin(rad);
									const isFlower = i % 3 === 0;
									return isFlower ? (
										<g key={i} transform={`translate(${cx},${cy})`}>
											<circle cx={0} cy={0} r={5.5} fill="#F7D6C1" fillOpacity={0.8} />
											<circle cx={5} cy={0} r={4}   fill="#F7D6C1" fillOpacity={0.6} />
											<circle cx={-5} cy={0} r={4}  fill="#F7D6C1" fillOpacity={0.6} />
											<circle cx={0} cy={5}  r={4}  fill="#F7D6C1" fillOpacity={0.6} />
											<circle cx={0} cy={-5} r={4}  fill="#F7D6C1" fillOpacity={0.6} />
											<circle cx={0} cy={0} r={2.5} fill="#C9A684" />
										</g>
									) : (
										<ellipse
											key={i}
											cx={cx} cy={cy}
											rx={8} ry={3.5}
											fill={i % 2 === 0 ? "#4A5E3A" : "#BFCBB2"}
											fillOpacity={0.55}
											transform={`rotate(${angle + 90} ${cx} ${cy})`}
										/>
									);
								})}
								{/* Heart in center */}
								<path
									d="M100,112 C100,112 82,98 82,88 C82,82 87,78 93,80 C96,81 99,84 100,87 C101,84 104,81 107,80 C113,78 118,82 118,88 C118,98 100,112 100,112Z"
									fill="#C4614A"
									fillOpacity={0.5}
								/>
							</svg>
							<p className="font-cursive text-5xl text-[#C9A684] relative z-10">J &amp; M</p>
						</div>
						<p className="text-xs uppercase tracking-[0.36em] text-[#8a7d6c] mt-6">
							{weddingDetails.date} · {weddingDetails.venue} · {weddingDetails.location}
						</p>
					</footer>
				</div>
			</div>
		</div>
		<MusicPlayer />
		<ScrollHint />
		<ScrollLock />
		</>
	);
}
