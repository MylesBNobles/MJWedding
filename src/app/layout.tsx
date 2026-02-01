import type { Metadata } from "next";
import { Great_Vibes } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const greatVibes = Great_Vibes({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-cursive",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Myles & Jeslin | Wedding",
	description:
		"Join us for our wedding celebration in Napa Valley, California.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={greatVibes.variable}>
			<body className="min-h-screen flex flex-col">
				<Header />
				<main className="flex-1">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
