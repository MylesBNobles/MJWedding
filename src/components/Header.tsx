"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Button } from "./Button";

const navLinks = [
	{ href: "/", label: "Home" },
	{ href: "/story", label: "Our Story" },
	{ href: "/itinerary", label: "Itinerary" },
	{ href: "/travel", label: "Travel" },
	{ href: "/attire", label: "Attire" },
	{ href: "/faq", label: "FAQ" },
{ href: "https://withjoy.com/myles-and-jeslin/registry", label: "Registry", external: true },
];

export function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const pathname = usePathname();
	const isHome = pathname === "/";
	const isStory = pathname === "/story";
	const isSaveTheDate = pathname === "/save-the-date";
	const isRsvp = pathname === "/rsvp";
	const hasTransparentHeader = isHome || isStory || isRsvp;

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 50);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 1024);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	if (isSaveTheDate) return null;

	const isActive = (href: string) => pathname === href;
	// On story page or home page mobile, keep header transparent regardless of scroll
	const isTransparent = hasTransparentHeader && (!scrolled || isStory || (isHome && isMobile));
	// Use white content only when in the hero/dark area (not scrolled), or always on story page
	// But use dark content when mobile menu is open (opaque background)
	const useWhiteContent = hasTransparentHeader && (!scrolled || isStory) && !isMobileMenuOpen;

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
				isTransparent && !isMobileMenuOpen
					? "bg-transparent"
					: "bg-[#FAF7F2] border-b border-[#EDE6D8]"
			}`}
		>
			<Container>
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link
						href="/"
						className={`text-3xl hover:opacity-80 transition-colors font-cursive ${
							useWhiteContent
								? "text-white drop-shadow-lg"
								: isRsvp
									? "text-[#C8102E]"
									: "text-fg"
						}`}
					>
						J & M
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								{...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
								className={`
                  px-3 py-2 text-sm rounded-md transition-colors font-medium
                  ${
										isActive(link.href)
											? isTransparent
												? "text-white font-semibold underline underline-offset-4"
												: isRsvp
													? "text-[#C8102E] font-semibold underline underline-offset-4"
													: "text-[#7B6A94] font-semibold underline underline-offset-4"
											: isTransparent
												? "text-white/80 hover:text-white"
												: isRsvp
													? "text-[#8B6558] hover:text-[#C8102E] hover:bg-red-50"
													: "text-[#8B7BA3] hover:text-[#6B5A84] hover:bg-accent/15"
									}
                `}
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Desktop CTAs */}
					<div className="hidden md:flex items-center gap-2">
						<Link href="/updates">
							<Button
								variant="ghost"
								size="sm"
								className={useWhiteContent ? "text-white/80 hover:text-white hover:bg-white/10" : "text-[#8a7d6c] hover:text-[#3F3A36]"}
							>
								Get Updates
							</Button>
						</Link>
						{!isRsvp && (
							<Link
								href="/rsvp"
								target="_blank"
								rel="noopener noreferrer"
								className={`inline-flex items-center justify-center font-medium rounded-md border text-sm px-5 py-1.5 transition-all duration-150 ${
									useWhiteContent
										? "bg-transparent border-white/70 text-white hover:bg-white/15"
										: "bg-[#C9A684] border-[#C9A684] text-white hover:bg-[#a8865e] hover:border-[#a8865e]"
								}`}
							>
								RSVP
							</Link>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className={`md:hidden p-2 rounded-md ${
							useWhiteContent
								? "text-white hover:bg-white/10"
								: "text-fg hover:bg-border/50"
						}`}
						aria-label="Toggle menu"
					>
						{isMobileMenuOpen ? (
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						) : (
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden py-4 border-t border-border">
						<nav className="flex flex-col gap-1">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setIsMobileMenuOpen(false)}
									{...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
									className={`
                    px-3 py-2 text-sm rounded-md transition-colors font-medium
                    ${
											isActive(link.href)
												? isRsvp
													? "text-[#C8102E] font-semibold bg-red-50"
													: "text-[#7B6A94] font-semibold bg-accent/20"
												: isRsvp
													? "text-[#8B6558] hover:text-[#C8102E] hover:bg-red-50"
													: "text-[#8B7BA3] hover:text-[#6B5A84] hover:bg-accent/15"
										}
                  `}
								>
									{link.label}
								</Link>
							))}
						</nav>
						<div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
							{!isRsvp && (
								<Link href="/rsvp" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>
									<Button
										variant="primary"
										fullWidth
										className="bg-[#C9A684] border-[#C9A684] hover:bg-[#a8865e] hover:border-[#a8865e] text-white"
									>
										RSVP
									</Button>
								</Link>
							)}
							<Link href="/updates" onClick={() => setIsMobileMenuOpen(false)}>
								<Button variant="secondary" fullWidth>
									Get Updates
								</Button>
							</Link>
						</div>
					</div>
				)}
			</Container>
		</header>
	);
}
