import Image from "next/image";
import { FadeUp } from "@/components/FadeUp";
import { attireSections } from "@/lib/mockData";

// ── Design tokens ─────────────────────────────────────────────────────────────

const colorPalette = [
	{ name: "Sky Blue",       hex: "#CFE8F7" },
	{ name: "Butter Yellow",  hex: "#F6E7B2" },
	{ name: "Soft Peach",     hex: "#F7D6C1" },
	{ name: "Soft Lavender",  hex: "#D6C6E1" },
	{ name: "Sage Green",     hex: "#BFCBB2" },
];

// ── Shared decorative components ──────────────────────────────────────────────

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

function ColorSwatch({ name, hex }: { name: string; hex: string }) {
	return (
		<div className="flex flex-col items-center">
			<svg viewBox="0 0 60 60" width="56" height="56" aria-hidden>
				<circle cx="30" cy="30" r="27" fill={hex} />
			</svg>
			<span className="mt-2 text-[0.6rem] text-[#8a7d6c] text-center leading-tight">{name}</span>
		</div>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AttirePage() {
	const blackTie = attireSections.find(s => s.id === "1")!;
	const smartCasual = attireSections.find(s => s.id === "2")!;

	return (
		<div className="bg-[#FAF7F2] min-h-screen">

			{/* ── Hero ── */}
			<div className="pt-24 pb-2">
				<div className="max-w-[720px] mx-auto px-6 sm:px-10 text-center">
					<FadeUp>
						<SectionLabel>Dress Code · Attire</SectionLabel>
						<h1 className="font-header text-3xl sm:text-4xl text-[#3F3A36] mb-4">
							What to Wear
						</h1>
						<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed max-w-[500px] mx-auto">
							We want you to feel incredible. Whether you arrive in a lehenga, a tuxedo, or your most cherished cultural dress — come as your most celebratory self.
						</p>
					</FadeUp>
				</div>
			</div>

			<div className="max-w-[720px] mx-auto px-6 sm:px-10">

				<BotanicalRule />

				{/* ── Cultural attire callout ── */}
				<FadeUp>
					<div className="bg-[#D6C6E1]/15 border border-[#D6C6E1]/40 rounded-xl p-6 sm:p-8 mb-10 text-center">
						<p className="text-[0.62rem] uppercase tracking-[0.46em] text-[#8a7d6c] mb-3">
							<span style={{ letterSpacing: 0, textTransform: "none", color: "#C9A684", marginRight: "8px", fontSize: "0.8rem" }}>✿</span>
							Celebrating Our Cultures
						</p>
						<p className="font-header text-xl text-[#3F3A36] mb-3">Traditional &amp; Cultural Attire Is Warmly Welcome</p>
						<p className="text-sm text-[#5a5048] leading-relaxed max-w-[480px] mx-auto">
							This celebration brings together many cultures, and that means the world to us. We highly encourage traditional or cultural attire from any background — it&rsquo;s part of what will make this day so special.
						</p>
					</div>
				</FadeUp>

				{/* ── Color palette ── */}
				<FadeUp>
					<SectionLabel>Suggested Palette</SectionLabel>
					<LetterHeading>Color Inspiration</LetterHeading>
					<p className="text-sm text-[#5a5048] leading-relaxed mb-7">
						If you&rsquo;d like some color inspiration, we&rsquo;re weaving these soft pastels throughout the celebration. These are purely suggestions — wear whatever makes you feel your most beautiful.
					</p>
					<div className="grid grid-cols-5 gap-3 mb-5">
						{colorPalette.map((color) => (
							<ColorSwatch key={color.name} name={color.name} hex={color.hex} />
						))}
					</div>
					<p className="text-xs text-[#8a7d6c] italic text-center">
						Coordination is a lovely touch, not a requirement — please don&rsquo;t feel obligated.
					</p>
				</FadeUp>

				<BotanicalRule />

				{/* ── Indo-Western Black Tie ── */}
				<FadeUp>
					<SectionLabel>Wedding Ceremony &amp; Reception</SectionLabel>
					<LetterHeading>{blackTie.title}</LetterHeading>
					<p className="text-sm sm:text-base text-[#5a5048] leading-relaxed mb-8">
						{blackTie.description}
					</p>

					{/* Reference images */}
					{blackTie.images.length > 0 && (
						<div className="grid grid-cols-2 gap-5 mb-10">
							{blackTie.images.map((src, i) => (
								<div key={i} className="flex flex-col items-center gap-3">
									<div
										style={{
											background: "white",
											padding: "8px 8px 28px",
											boxShadow: "0 8px 28px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
											transform: i === 0 ? "rotate(-1.5deg)" : "rotate(1.5deg)",
											display: "inline-block",
											width: "100%",
										}}
									>
										<Image
											src={src}
											alt={i === 0 ? "Attire inspiration" : "Attire to avoid"}
											width={320}
											height={400}
											style={{ display: "block", width: "100%", height: "auto", objectFit: "cover", aspectRatio: "4/5" }}
										/>
									</div>
									<p className="text-[0.62rem] uppercase tracking-[0.3em] text-[#8a7d6c]">
										{i === 0 ? "✦  Wear" : "—  Avoid"}
									</p>
								</div>
							))}
						</div>
					)}

					{/* Do / Avoid lists */}
					{(blackTie.doList.length > 0 || blackTie.avoidList.length > 0) && (
						<div className="grid sm:grid-cols-2 gap-5">
							{/* Do */}
							<div className="bg-[#FBF7EE] border border-[#C9A684]/20 rounded-xl p-6">
								<p className="text-[0.62rem] uppercase tracking-[0.36em] text-[#C9A684] mb-4">✦ &nbsp; Wear</p>
								<ul className="space-y-2.5">
									{blackTie.doList.map((item, i) => (
										<li key={i} className="flex gap-3 text-sm text-[#5a5048] leading-relaxed">
											<span className="flex-shrink-0 text-[#BFCBB2] mt-0.5">✦</span>
											{item}
										</li>
									))}
								</ul>
							</div>

							{/* Avoid */}
							<div className="bg-[#FBF7EE] border border-[#C9A684]/20 rounded-xl p-6">
								<p className="text-[0.62rem] uppercase tracking-[0.36em] text-[#8a7d6c] mb-4">—  &nbsp; Avoid</p>
								<ul className="space-y-2.5">
									{blackTie.avoidList.map((item, i) => (
										<li key={i} className="flex gap-3 text-sm text-[#5a5048] leading-relaxed">
											<span className="flex-shrink-0 text-[#C9A684]/50 mt-0.5">—</span>
											{item}
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</FadeUp>

				<BotanicalRule />

				{/* ── Smart Casual ── */}
				<FadeUp>
					<SectionLabel>Welcome Party &amp; Farewell Brunch</SectionLabel>
					<LetterHeading>Smart Casual</LetterHeading>
					<div className="bg-[#FBF7EE] border border-[#C9A684]/20 rounded-xl p-6 sm:p-8">
						<p className="text-sm text-[#5a5048] leading-relaxed italic max-w-[480px]">
							{smartCasual.description}
						</p>
					</div>
				</FadeUp>

				{/* ── Footer ── */}
				<div className="border-t border-[#C9A684]/20 py-10 text-center">
					<p className="text-sm text-[#5a5048] mb-2">Questions about attire?</p>
					<a
						href="mailto:hello@jeslinandmyles.com"
						className="text-sm text-[#C9A684] hover:text-[#a8865e] transition-colors underline underline-offset-2"
					>
						hello@jeslinandmyles.com
					</a>
				</div>

			</div>
		</div>
	);
}
