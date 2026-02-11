"use client";

import {
	Container,
	SectionHeader,
	Card,
	Badge,
	Button,
	Toast,
	useToast,
} from "@/components";
import { travelInfo } from "@/lib/mockData";
import { getLastUpdated } from "@/lib/storage";
import { useState } from "react";

export default function TravelPage() {
	const { toast, showToast, hideToast } = useToast();
	const [expanded, setExpanded] = useState<string | null>(null);

	const copyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		showToast("Link copied");
	};

	const itinerary = `Wedding Weekend Itinerary
========================

Friday, June 13
- Welcome Drinks: 6:00 PM - 9:00 PM
	The Rooftop at Hotel Luna

Saturday, June 14
- Ceremony: 4:30 PM
- Cocktail Hour: 5:30 PM
- Reception & Dinner: 6:30 PM - 11:00 PM
	Villa Rosa, Napa Valley

Sunday, June 15
- Farewell Brunch: 10:00 AM - 1:00 PM
	Hotel Luna Restaurant`;

	const copyItinerary = () => {
		navigator.clipboard.writeText(itinerary);
		showToast("Itinerary copied");
	};

	const airportDetails: Record<
		string,
		{
			summary: string;
			options: Array<{
				title: string;
				steps: string[];
				links?: { label: string; href: string }[];
			}>;
		}
	> = {
		FLR: {
			summary:
				"Florence is the closest and easiest airport for reaching Siena. Estimated total travel time: ~1 hour 15–30 minutes.",
			options: [
				{
					title: "Option 1: Train (Recommended)",
					steps: [
						"Take the T2 tram (Vespucci line) from Florence Airport to Firenze Santa Maria Novella Station (~20 minutes).",
						"From Firenze SMN, take a regional train to Siena Station (~1 hour; trains roughly hourly).",
						"From Siena station, take a taxi to your hotel or the venue (10–20 minutes).",
					],
					links: [
						{ label: "Tram info", href: "https://www.gestramvia.it/" },
						{ label: "Trenitalia", href: "https://www.trenitalia.com/" },
					],
				},
				{
					title: "Option 2: Taxi / Private Transfer",
					steps: [
						"Direct taxi or private car from Florence Airport to Siena (~1 hour 10–20 minutes).",
						"Estimated cost: €150–€180 (book in advance for the best rates).",
					],
					links: [
						{ label: "Florence taxi info", href: "https://www.4390.it/" },
					],
				},
			],
		},
		PSA: {
			summary:
				"Pisa is a convenient alternative with more international flights. Estimated total travel time: ~1 hour 45–2 hours.",
			options: [
				{
					title: "Option 1: Train (Recommended)",
					steps: [
						"Take the Pisamover shuttle from the airport to Pisa Centrale (~5 minutes).",
						"Take a train from Pisa Centrale to Firenze Santa Maria Novella (~1 hour).",
						"From Firenze SMN, take a regional train to Siena (~1 hour).",
						"Taxi from Siena station to hotel/venue (10–20 minutes).",
					],
					links: [
						{ label: "Pisamover", href: "https://www.pisamover.com/" },
						{ label: "Trenitalia", href: "https://www.trenitalia.com/" },
					],
				},
				{
					title: "Option 2: Taxi / Private Transfer",
					steps: [
						"Direct taxi or private car from Pisa Airport to Siena (~1 hour 45 minutes).",
						"Estimated cost: €180–€220.",
					],
					links: [{ label: "Pisa taxi info", href: "https://www.cotapi.it/" }],
				},
			],
		},
		FCO: {
			summary:
				"Rome Fiumicino is the furthest option but useful for long-haul flights. Estimated total travel time: ~3–3.5 hours.",
			options: [
				{
					title: "Option 1: Train (Recommended)",
					steps: [
						"Take the Leonardo Express from FCO to Roma Termini (~30 minutes).",
						"Take a high-speed train from Roma Termini to Firenze SMN (~1h30).",
						"From Firenze SMN take a regional train to Siena (~1 hour).",
						"Taxi from Siena station to hotel/venue (10–20 minutes).",
					],
					links: [
						{
							label: "Leonardo Express",
							href: "https://www.trenitalia.com/en/services/leonardo-express.html",
						},
						{ label: "Trenitalia", href: "https://www.trenitalia.com/" },
						{ label: "Italo", href: "https://www.italotreno.it/" },
					],
				},
				{
					title: "Option 2: Taxi / Private Transfer",
					steps: [
						"Direct private transfer from Rome FCO to Siena (~2.5–3 hours).",
						"Estimated cost: €300–€400.",
					],
					links: [{ label: "Rome taxi info", href: "https://www.3570.it/" }],
				},
			],
		},
	};

	function AirportCard({
		airport,
	}: {
		airport: (typeof travelInfo.airports)[number];
	}) {
		const isOpen = expanded === airport.code;

		return (
			<Card
				padding="sm"
				className="cursor-pointer"
				onClick={() => setExpanded(isOpen ? null : airport.code)}
			>
				<div className="flex items-center justify-between">
					<div>
						<span className="font-medium text-fg">{airport.name}</span>
						<span className="text-muted ml-2">({airport.code})</span>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm text-muted">{airport.driveTime}</span>
						{airport.recommended && <Badge variant="accent">Recommended</Badge>}
						<svg
							className={`w-5 h-5 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
							viewBox="0 0 20 20"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden
						>
							<path
								d="M6 8l4 4 4-4"
								stroke="currentColor"
								strokeWidth={1.5}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>

				{isOpen && (
					<div className="mt-4 text-sm text-muted">
						<p className="mb-3 text-fg">
							{airportDetails[airport.code as keyof typeof airportDetails]
								?.summary || "Directions and options for this airport."}
						</p>

						{(
							airportDetails[airport.code as keyof typeof airportDetails]
								?.options || []
						).map((opt, idx) => (
							<div key={idx} className="mb-3">
								<h4 className="font-medium text-fg mb-1">{opt.title}</h4>
								<ol className="list-decimal list-inside space-y-1 text-sm text-muted">
									{opt.steps.map((step, sidx) => (
										<li key={sidx}>{step}</li>
									))}
								</ol>
								{opt.links && (
									<div className="mt-2 flex flex-wrap gap-2">
										{opt.links.map((lnk, lidx) => (
											<a
												key={lidx}
												href={lnk.href}
												target="_blank"
												rel="noreferrer"
												className="text-sm text-accent hover:underline"
											>
												{lnk.label}
											</a>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</Card>
		);
	}

	return (
		<section className="py-16">
			<Container size="md">
				<div className="flex items-start justify-between gap-4 mb-8">
					<SectionHeader
						title="Travel"
						subtitle="Everything you need to plan your trip"
						className="mb-0"
					/>
					<Button variant="ghost" size="sm" onClick={copyLink}>
						Copy link
					</Button>
				</div>

				{/* Wedding Venue */}
				<div className="mb-12">
					<h3 className="text-xl font-semibold text-fg mb-4">Wedding Venue</h3>
					<Card className="border-accent">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h4 className="font-semibold text-fg">Villa Di Geggiano</h4>
								<p className="text-sm text-muted mt-1">
									Strada di Geggiano 1, 53010 Castelnuovo Berardenga, Siena, Italy
								</p>
							</div>
							<a
								href="https://maps.google.com/?q=Villa+Di+Geggiano+Siena+Italy"
								target="_blank"
								rel="noreferrer"
							>
								<Button variant="secondary">View on Map</Button>
							</a>
						</div>
					</Card>
				</div>

				{/* Airports */}
				<div className="mb-12">
					<h3 className="text-xl font-semibold text-fg mb-4">Airports</h3>
					<div className="grid gap-3">
						{travelInfo.airports.map((airport) => (
							<AirportCard key={airport.code} airport={airport} />
						))}
					</div>
				</div>

				{/* Travel Windows */}
				<div className="mb-12 grid sm:grid-cols-2 gap-6">
					<Card>
						<h4 className="font-semibold text-fg mb-3">Arrival</h4>
						<div className="space-y-2 text-sm">
							<p className="text-muted">
								<span className="font-medium text-fg">Ideal:</span>{" "}
								{travelInfo.arrivalWindow.ideal}
							</p>
							<p className="text-muted">
								<span className="font-medium text-fg">Latest:</span>{" "}
								{travelInfo.arrivalWindow.latest}
							</p>
						</div>
					</Card>
					<Card>
						<h4 className="font-semibold text-fg mb-3">Departure</h4>
						<div className="space-y-2 text-sm">
							<p className="text-muted">
								<span className="font-medium text-fg">Earliest:</span>{" "}
								{travelInfo.departureWindow.earliest}
							</p>
							<p className="text-muted">
								<span className="font-medium text-fg">Ideal:</span>{" "}
								{travelInfo.departureWindow.ideal}
							</p>
						</div>
					</Card>
				</div>

				{/* Hotel Block */}
				<div className="mb-12">
					<h3 className="text-xl font-semibold text-fg mb-4">Hotel Block</h3>
					<Card className="border-accent">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h4 className="font-semibold text-fg">
									{travelInfo.hotelBlock.name}
								</h4>
								<p className="text-sm text-muted mt-1">
									Use code{" "}
									<span className="font-mono font-medium text-fg">
										{travelInfo.hotelBlock.code}
									</span>
								</p>
								<p className="text-sm text-muted">
									Book by {travelInfo.hotelBlock.bookBy}
								</p>
							</div>
							<Button variant="secondary">Book Now</Button>
						</div>
					</Card>
				</div>

				{/* Lodging Areas */}
				<div className="mb-12">
					<h3 className="text-xl font-semibold text-fg mb-4">Lodging Areas</h3>
					<div className="grid gap-3">
						{travelInfo.lodgingAreas.map((area) => (
							<Card key={area.name} padding="sm">
								<div className="flex items-start justify-between gap-4">
									<div>
										<span className="font-medium text-fg">{area.name}</span>
										<p className="text-sm text-muted mt-1">
											{area.description}
										</p>
									</div>
									<span className="text-sm text-muted flex-shrink-0">
										{area.priceRange}
									</span>
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Transportation */}
				<div className="mb-12">
					<h3 className="text-xl font-semibold text-fg mb-4">Getting Around</h3>
					<div className="grid gap-3">
						{travelInfo.transport.map((option) => (
							<Card key={option.type} padding="sm">
								<div className="flex items-start justify-between gap-4">
									<div>
										<span className="font-medium text-fg">{option.type}</span>
										<p className="text-sm text-muted mt-1">
											{option.description}
										</p>
									</div>
									{option.recommended && (
										<Badge variant="accent">Recommended</Badge>
									)}
								</div>
							</Card>
						))}
					</div>
				</div>

				{/* Quick Itinerary */}
				<div className="mb-12">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-xl font-semibold text-fg">Quick Itinerary</h3>
						<Button variant="ghost" size="sm" onClick={copyItinerary}>
							Copy
						</Button>
					</div>
					<Card className="bg-border/30">
						<pre className="text-sm text-fg whitespace-pre-wrap font-mono">
							{itinerary}
						</pre>
					</Card>
				</div>

				{/* Tips */}
				<div className="mb-12">
					<h3 className="text-xl font-semibold text-fg mb-4">
						Tips for Visitors
					</h3>
					<Card>
						<ul className="space-y-3">
							{travelInfo.tips.map((tip, index) => (
								<li key={index} className="flex gap-3 text-sm">
									<span className="text-accent flex-shrink-0">•</span>
									<span className="text-muted">{tip}</span>
								</li>
							))}
						</ul>
					</Card>
				</div>

				<p className="text-sm text-muted">Last updated: {getLastUpdated()}</p>
			</Container>

			<Toast
				message={toast.message}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</section>
	);
}
