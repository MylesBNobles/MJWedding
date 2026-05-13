import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionHeader } from "@/components";

export const metadata: Metadata = {
	title: "Terms of Service — Jeslin & Myles",
	description: "Terms governing SMS communications and use of the Jeslin & Myles wedding website.",
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

export default function TermsPage() {
	return (
		<section className="pt-24 pb-16">
			<Container size="md">
				<div className="flex items-start justify-between gap-4 mb-8">
					<SectionHeader
						title="Terms of Service"
						subtitle="Guidelines for using this website and our SMS program"
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
					These Terms of Service govern your use of the Jeslin &amp; Myles wedding website and our SMS communication program. By visiting this website or providing your phone number, you agree to these terms. This site exists solely to share information about our wedding celebration with our invited guests.
				</Body>

				<Divider />

				<SectionTitle>SMS Message Program</SectionTitle>
				<Body>
					By submitting your phone number through our RSVP form, you consent to receive wedding-related SMS messages from Jeslin &amp; Myles. These messages may include:
				</Body>
				<ul className="mt-4 space-y-2 text-sm sm:text-base text-muted leading-relaxed list-none">
					{[
						"RSVP confirmations and reminders",
						"Wedding day updates and logistics",
						"Travel and accommodation information",
						"Event notifications and schedule changes",
						"General wedding announcements",
					].map((item, i) => (
						<li key={i} className="flex gap-3">
							<span className="text-accent flex-shrink-0 mt-0.5">·</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
				<p className="text-sm sm:text-base text-muted leading-relaxed mt-4">
					SMS messages are sent only to invited guests who have provided their phone number. We do not send unsolicited messages.
				</p>

				<Divider />

				<SectionTitle>Message Frequency &amp; Rates</SectionTitle>
				<Body>
					Message frequency will vary depending on how close we are to the wedding date and any updates that arise. You may receive more messages in the weeks leading up to the event. Standard message and data rates may apply depending on your mobile carrier and plan.
				</Body>

				<Divider />

				<SectionTitle>How to Opt Out</SectionTitle>
				<Body>
					You can opt out of SMS messages at any time. Simply reply{" "}
					<span className="font-mono text-xs bg-border/50 text-fg px-1.5 py-0.5 rounded">STOP</span>
					{" "}to any message you receive from us and you will be unsubscribed immediately. You will receive a one-time confirmation that you have been removed.
				</Body>
				<p className="text-sm sm:text-base text-muted leading-relaxed mt-4">
					If you need assistance, reply{" "}
					<span className="font-mono text-xs bg-border/50 text-fg px-1.5 py-0.5 rounded">HELP</span>
					{" "}to any message or contact us directly at the email below.
				</p>

				<Divider />

				<SectionTitle>Contact Us</SectionTitle>
				<Body>
					If you have any questions about these terms or our SMS program, please don&rsquo;t hesitate to reach out at{" "}
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
