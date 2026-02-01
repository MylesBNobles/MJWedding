"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { Button } from "./Button";

const navLinks = [
	{ href: "/story", label: "Our Story" },
	{ href: "/timeline", label: "Timeline" },
	{ href: "/travel", label: "Travel" },
	{ href: "/attire", label: "Attire" },
	{ href: "/faq", label: "FAQ" },
	{ href: "/updates", label: "Updates" },
];

export function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const pathname = usePathname();
	const isHome = pathname === "/";

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 50);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const isActive = (href: string) => pathname === href;
	const isTransparent = isHome && !scrolled;

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
				isTransparent
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
							isTransparent
								? "text-white drop-shadow-lg"
								: "text-fg"
						}`}
					>
						Jeslin & Myles
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-1">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className={`
                  px-3 py-2 text-sm rounded-md transition-colors font-medium
                  ${
										isActive(link.href)
											? isTransparent
												? "text-white font-semibold"
												: "text-[#7B6A94] font-semibold bg-accent/20"
											: isTransparent
												? "text-white/80 hover:text-white"
												: "text-[#8B7BA3] hover:text-[#6B5A84] hover:bg-accent/15"
									}
                `}
							>
								{link.label}
							</Link>
						))}
					</nav>

					{/* Desktop CTAs */}
					<div className="hidden md:flex items-center gap-3">
						<Link href="/updates">
							<Button variant="ghost" size="sm">
								Subscribe
							</Button>
						</Link>
						<Link href="/plans">
							<Button variant="primary" size="sm">
								Share Your Plans
							</Button>
						</Link>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className={`md:hidden p-2 rounded-md ${
							isTransparent
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
									className={`
                    px-3 py-2 text-sm rounded-md transition-colors font-medium
                    ${
											isActive(link.href)
												? "text-[#7B6A94] font-semibold bg-accent/20"
												: "text-[#8B7BA3] hover:text-[#6B5A84] hover:bg-accent/15"
										}
                  `}
								>
									{link.label}
								</Link>
							))}
						</nav>
						<div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
							<Link href="/updates" onClick={() => setIsMobileMenuOpen(false)}>
								<Button variant="secondary" fullWidth>
									Subscribe
								</Button>
							</Link>
							<Link href="/plans" onClick={() => setIsMobileMenuOpen(false)}>
								<Button variant="primary" fullWidth>
									Share Your Plans
								</Button>
							</Link>
						</div>
					</div>
				)}
			</Container>
		</header>
	);
}
