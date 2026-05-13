import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeader } from "@/components";

export const metadata: Metadata = {
	title: "Privacy Policy — Jeslin & Myles",
	description: "How we collect and use your information for the Jeslin & Myles wedding.",
};

const email = "hello@jeslinandmyles.com";

function Divider() {
	return (
		<div className="flex items-center gap-3 my-10" aria-hidden>
			<div className="flex-1 h-px bg-border" />
			<span className="text-accent text-xs">✿</span>
			<div className="flex-1 h-px bg-border" />
		</div>
	);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
	return (
		<h2 className="text-lg font-semibold text-fg mb-3">{children}</h2>
	);
}

function Body({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-sm sm:text-base text-muted leading-relaxed">{children}</p>
	);
}

export default function PrivacyPage() {
	return (
		<section className="pt-24 pb-16">
			<Container size="md">
				<div className="flex items-start justify-between gap-4 mb-8">
					<SectionHeader
						title="Privacy Policy"
						subtitle="How we handle your information"
						className="mb-0"
					/>
					<Link
						href="/"
						className="text-sm text-muted hover:text-accent transition-colors whitespace-nowrap mt-1"
					>
						← Back to home
					</Link>
				</div>

				<p className="text-xs text-muted mb-12">Last updated: May 2026</p>

				<SectionTitle>Introduction</SectionTitle>
				<Body>
					This Privacy Policy describes how Jeslin &amp; Myles (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collect, use, and protect the personal information you share with us in connection with our wedding celebration. We take your privacy seriously and are committed to being transparent about our practices.
				</Body>

				<Divider />

				<SectionTitle>Information We Collect</SectionTitle>
				<Body>
					When you RSVP or interact with our wedding website, we may collect the following information:
				</Body>
				<ul className="mt-4 space-y-2 text-sm sm:text-base text-muted leading-relaxed list-none">
					{[
						"Your name and the names of your guests",
						"Your phone number",
						"Your RSVP response and meal preferences",
						"Travel and accommodation details you share with us",
						"Any messages or notes you send us through the website",
					].map((item, i) => (
						<li key={i} className="flex gap-3">
							<span className="text-accent flex-shrink-0 mt-0.5">·</span>
							<span>{item}</span>
						</li>
					))}
				</ul>

				<Divider />

				<SectionTitle>How We Use Your Information</SectionTitle>
				<Body>
					Your information is used solely for the purpose of planning and communicating about our wedding celebration. This includes confirming your RSVP, sending you wedding-related updates, coordinating travel and logistics, and ensuring we can reach you with any important changes or reminders leading up to the event.
				</Body>
				<p className="text-sm sm:text-base text-muted leading-relaxed mt-4">
					We will never use your information for any commercial purpose, advertising, or anything unrelated to our wedding.
				</p>

				<Divider />

				<SectionTitle>SMS Communications</SectionTitle>
				<Body>
					By providing your phone number, you consent to receive SMS messages from us related to the wedding. These messages may include RSVP confirmations, wedding updates, travel logistics, and event reminders.
				</Body>
				<p className="text-sm sm:text-base text-muted leading-relaxed mt-4">
					Your SMS consent and phone number are never shared with third parties for their own marketing purposes. Message frequency may vary. Standard message and data rates may apply.
				</p>
				<p className="text-sm sm:text-base text-muted leading-relaxed mt-4">
					You may opt out of SMS messages at any time by replying{" "}
					<span className="font-mono text-xs bg-border/50 text-fg px-1.5 py-0.5 rounded">STOP</span>
					{" "}to any message. You can also reply{" "}
					<span className="font-mono text-xs bg-border/50 text-fg px-1.5 py-0.5 rounded">HELP</span>
					{" "}for assistance.
				</p>

				<Divider />

				<SectionTitle>We Never Sell Your Data</SectionTitle>
				<Body>
					We do not sell, rent, trade, or otherwise transfer your personal information to any third party. Your information is shared only with trusted services we use to operate this website and communicate with you (such as our SMS provider), and only to the extent necessary to deliver those services.
				</Body>

				<Divider />

				<SectionTitle>Contact Us</SectionTitle>
				<Body>
					If you have any questions about this Privacy Policy or how we handle your information, please reach out to us anytime at{" "}
					<a
						href={`mailto:${email}`}
						className="text-accent underline underline-offset-4 hover:text-accent-warm transition-colors"
					>
						{email}
					</a>
					.
				</Body>
			</Container>
		</section>
	);
}
