import Link from "next/link";
import { Container, Card, Badge } from "@/components";
import { weddingDetails, updateItems } from "@/lib/mockData";

export default function HomePage() {
	const latestUpdate = updateItems.sort(
		(a, b) =>
			new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
	)[0];

	const checklist = [
		{ text: "Sign up to get updates", href: "/updates" },
		{ text: "Plan your travel", href: "/travel" },
		{ text: "Read our story", href: "/story" },
	];

	return (
		<>
			{/* Hero Section */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-24">
				{/* Background Image */}
				<div
					className="absolute inset-0 bg-cover bg-bottom bg-no-repeat"
					style={{ backgroundImage: "url(/images/MJWeddingPic1.jpeg)" }}
				/>
				{/* Warm overlay for text readability */}
				<div className="absolute inset-0 bg-gradient-to-b from-[#3F3A36]/30 via-[#3F3A36]/20 to-[#FAF7F2]/30" />

				<Container size="md" className="relative z-10">
					<div className="text-center">
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
				</Container>
			</section>

			{/* What to do next */}
			<section className="py-16 bg-[#FAF7F2]">
				<Container size="md">
					<h2 className="text-2xl font-semibold text-fg mb-6 text-center">
						What to do next
					</h2>
					<div className="space-y-3">
						{checklist.map((item, index) => (
							<Link key={index} href={item.href}>
								<Card className="flex items-center gap-4 hover:border-accent hover:shadow-md transition-all cursor-pointer group">
									<span className="text-fg">{item.text}</span>
									<svg
										className="w-5 h-5 text-accent/60 group-hover:text-accent ml-auto transition-colors"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</Card>
							</Link>
						))}
					</div>
				</Container>
			</section>

			{/* Latest Update */}
			<section className="py-16 bg-[#FAF7F2] border-y border-[#EDE6D8]">
				<Container size="md">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-semibold text-fg">Latest Update</h2>
						<Link
							href="/updates"
							className="text-sm text-accent hover:text-accent-warm transition-colors font-medium"
						>
							View all →
						</Link>
					</div>
					<Card className="border-l-4 border-l-accent">
						<div className="flex items-start justify-between gap-4 mb-3">
							<h3 className="text-lg font-medium text-fg">
								{latestUpdate.title}
							</h3>
							<Badge>{latestUpdate.category}</Badge>
						</div>
						<p className="text-muted mb-3">{latestUpdate.body}</p>
						<p className="text-sm text-accent/70">
							{new Date(latestUpdate.publishedAt).toLocaleDateString("en-US", {
								month: "long",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</Card>
				</Container>
			</section>
		</>
	);
}
