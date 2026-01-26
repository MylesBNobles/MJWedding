"use client";

import { ReactNode, HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
	className?: string;
	padding?: "sm" | "md" | "lg";
};

const paddingClasses = {
	sm: "p-4",
	md: "p-6",
	lg: "p-8",
};

export function Card({
	children,
	className = "",
	padding = "md",
	...rest
}: CardProps) {
	return (
		<div
			className={`bg-card border border-border rounded-lg shadow-sm ${paddingClasses[padding]} ${className}`}
			{...rest}
		>
			{children}
		</div>
	);
}
