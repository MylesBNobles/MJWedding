import Link from "next/link";
import { FlipCountdown } from "@/components/FlipCountdown";
import { FadeUp } from "@/components/FadeUp";
import { RSVPButton } from "@/components/RSVPButton";
import { FloatingBotanicals } from "@/components/FloatingBotanicals";
import { weddingDetails } from "@/lib/mockData";

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

// ── Site navigation cards ─────────────────────────────────────────────────────

const navCards = [
	{ href: "/story",    label: "Our Story",       blurb: "How we got here.",                  icon: "♡" },
	{ href: "/travel",   label: "Travel & Hotels",  blurb: "Getting to Tuscany.",               icon: "✈" },
	{ href: "/attire",   label: "Attire",           blurb: "What to wear.",                     icon: "✦" },
	{ href: "/itinerary",label: "Itinerary",        blurb: "The full weekend.",                 icon: "☀" },
	{ href: "/faq",      label: "FAQ",              blurb: "Common questions answered.",         icon: "✿" },
	{
		href: "https://withjoy.com/myles-and-jeslin/registry",
		label: "Registry",
		blurb: "Experiences we're dreaming of.",
		icon: "✦",
		external: true,
	},
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
	return (
		<>
			{/* ── Hero ── */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24">
				<div
					className="absolute inset-0 bg-cover bg-bottom bg-no-repeat"
					style={{ backgroundImage: "url(/images/MJWeddingPic1.jpeg)" }}
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-[#3F3A36]/30 via-[#3F3A36]/20 to-[#FAF7F2]/30" />

				<div className="relative z-10 text-center px-6">
					<p className="text-xl sm:text-2xl font-medium text-white drop-shadow-lg mb-4 uppercase tracking-widest">
						The Wedding Of
					</p>
					<h1 className="text-7xl sm:text-9xl font-cursive text-white drop-shadow-lg mb-6">
						Jeslin <span className="text-4xl sm:text-5xl">&amp;</span> Myles
					</h1>
					<p className="text-xl sm:text-2xl font-medium text-white drop-shadow-lg mb-10 uppercase tracking-widest">
						{weddingDetails.date} · {weddingDetails.location}
					</p>
				</div>
			</section>

			{/* ── Deckled edge transition ── */}
			<svg
				viewBox="0 0 1440 80"
				preserveAspectRatio="none"
				className="w-full block -mt-1"
				aria-hidden
			>
				<path
					d="M0,80 L0,52 C22,44 34,60 56,52 C78,44 88,62 112,54 C136,46 146,34 168,44 C190,54 202,38 224,48 C246,58 258,40 280,50 C302,60 314,42 338,52 C362,62 372,46 396,54 C420,62 430,44 454,52 C478,60 488,42 512,50 C536,58 548,38 572,48 C596,58 606,36 630,46 C654,56 664,32 688,44 C712,56 722,28 748,40 C774,52 784,24 810,36 C836,48 846,20 872,32 C898,44 908,16 934,28 C960,40 970,12 996,24 C1022,36 1032,8 1058,20 C1084,32 1094,6 1120,18 C1146,30 1156,4 1182,14 C1208,24 1218,2 1244,12 C1270,22 1280,2 1306,10 C1332,18 1342,4 1368,12 C1380,16 1400,6 1420,10 C1428,12 1436,8 1440,10 L1440,80 Z"
					fill="#FBF7EE"
				/>
			</svg>

			{/* ── Parchment content ── */}
			<div className="bg-[#FBF7EE] relative">
				<FloatingBotanicals />

				<div className="max-w-[720px] mx-auto px-6 sm:px-10">

					{/* Countdown */}
					<FlipCountdown />

					<BotanicalRule />

					{/* Navigation grid */}
					<FadeUp>
						<div className="text-center mb-8">
							<SectionLabel>Everything You Need</SectionLabel>
							<h2 className="font-header text-2xl sm:text-3xl text-[#3F3A36]">
								Plan Your Celebration
							</h2>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
							{navCards.map((card) => (
								<Link
									key={card.href}
									href={card.href}
									{...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									className="group bg-white border border-[#EDE6D8] rounded-xl p-5 transition-all hover:border-[#C9A684]/60 hover:shadow-sm"
								>
									<div className="text-lg text-[#C9A684] mb-2" aria-hidden>{card.icon}</div>
									<p className="font-header text-[#3F3A36] text-sm mb-1 group-hover:text-[#C9A684] transition-colors">
										{card.label}
									</p>
									<p className="text-xs text-[#8a7d6c] leading-snug">{card.blurb}</p>
								</Link>
							))}
						</div>
					</FadeUp>

					<BotanicalRule />

					{/* RSVP nudge */}
					<FadeUp>
						<div
							className="relative rounded-2xl overflow-hidden border border-[#E8C4B8]/50 text-center px-8 py-10 mb-14"
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

							{/* Tuscan hills */}
							<svg viewBox="0 0 480 60" preserveAspectRatio="none" className="absolute bottom-0 inset-x-0 w-full" aria-hidden>
								<path d="M0,60 L0,40 C40,28 80,44 120,36 C160,28 200,16 240,22 C280,28 320,42 360,36 C400,30 440,18 480,26 L480,60 Z" fill="#4A5E3A" fillOpacity="0.07" />
								<path d="M0,60 L0,50 C50,38 100,52 150,46 C200,40 250,30 300,38 C350,46 400,36 480,42 L480,60 Z" fill="#C9A684" fillOpacity="0.09" />
							</svg>
						</div>
					</FadeUp>

				</div>

				{/* Footer */}
				<footer className="border-t border-[#C9A684]/20 py-14 text-center">
					<p className="font-cursive text-5xl text-[#C9A684]">J &amp; M</p>
					<p className="text-xs uppercase tracking-[0.36em] text-[#8a7d6c] mt-6">
						{weddingDetails.date} · {weddingDetails.venue} · {weddingDetails.location}
					</p>
					<p className="text-xs text-[#8a7d6c] mt-4">
						Questions?{" "}
						<a href="mailto:hello@jeslinandmyles.com" className="text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2">
							hello@jeslinandmyles.com
						</a>
					</p>
				</footer>
			</div>
		</>
	);
}
