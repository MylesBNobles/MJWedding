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
	title: "Jeslin & Myles | Wedding",
	description: "Jeslin & Myles are getting married!",
	metadataBase: new URL("https://jeslinandmyles.com"),
	openGraph: {
		title: "Jeslin & Myles | Wedding",
		description: "Jeslin & Myles are getting married!",
		url: "https://jeslinandmyles.com",
		siteName: "Jeslin & Myles | Wedding",
		images: [
			{
				url: "/MJWeddingPic1.jpeg",
				width: 1200,
				height: 630,
				alt: "Jeslin and Myles",
			},
		],
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Jeslin & Myles | Wedding",
		description: "Jeslin & Myles are getting married!",
		images: ["/MJWeddingPic1.jpeg"],
	},
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
