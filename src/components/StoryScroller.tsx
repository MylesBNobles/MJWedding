"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StorySlide } from "@/lib/types";

type StoryScrollerProps = {
	slides: StorySlide[];
};

const ITEM_HEIGHT = 56;

export default function StoryScroller({ slides }: StoryScrollerProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
	const scrollRaf = useRef<number | null>(null);
	const snapTimeout = useRef<number | null>(null);
	const wheelDelta = useRef(0);
	const [activeIndex, setActiveIndex] = useState(0);
	const [spacerHeight, setSpacerHeight] = useState(0);

	const activeSlide = useMemo(() => slides[activeIndex], [slides, activeIndex]);

	useEffect(() => {
		const el = listRef.current;
		if (!el) return;

		const updateSpacer = () => {
			const nextSpacer = Math.max(0, el.clientHeight / 2 - ITEM_HEIGHT / 2);
			setSpacerHeight(nextSpacer);
		};

		updateSpacer();
		window.addEventListener("resize", updateSpacer);

		return () => window.removeEventListener("resize", updateSpacer);
	}, []);

	useEffect(() => {
		const el = listRef.current;
		if (!el) return;
		const target = itemRefs.current[0];
		if (!target) return;

		const top =
			target.offsetTop - (el.clientHeight / 2 - target.clientHeight / 2);
		el.scrollTo({ top, behavior: "auto" });
	}, [slides.length]);

	useEffect(() => {
		const root = rootRef.current;
		const list = listRef.current;
		if (!root || !list) return;

		const handleWheel = (event: WheelEvent) => {
			if (event.deltaY === 0) return;
			event.preventDefault();
			wheelDelta.current += event.deltaY;
			const threshold = 40;
			if (Math.abs(wheelDelta.current) < threshold) return;
			const applied = wheelDelta.current * 0.3;
			wheelDelta.current = 0;
			list.scrollBy({ top: applied, behavior: "auto" });
		};

		root.addEventListener("wheel", handleWheel, { passive: false });

		return () => root.removeEventListener("wheel", handleWheel);
	}, []);

	const getClosestIndex = () => {
		const el = listRef.current;
		if (!el) return 0;
		const center = el.scrollTop + el.clientHeight / 2;
		let closest = 0;
		let closestDistance = Number.POSITIVE_INFINITY;

		itemRefs.current.forEach((item, index) => {
			if (!item) return;
			const itemCenter = item.offsetTop + item.clientHeight / 2;
			const distance = Math.abs(center - itemCenter);
			if (distance < closestDistance) {
				closestDistance = distance;
				closest = index;
			}
		});

		return closest;
	};

	const snapToIndex = (index: number) => {
		const el = listRef.current;
		const item = itemRefs.current[index];
		if (!el || !item) return;

		const top = item.offsetTop - (el.clientHeight / 2 - item.clientHeight / 2);
		el.scrollTo({ top, behavior: "smooth" });
	};

	const handleScroll = () => {
		if (scrollRaf.current) {
			cancelAnimationFrame(scrollRaf.current);
		}

		scrollRaf.current = requestAnimationFrame(() => {
			const nextIndex = getClosestIndex();
			setActiveIndex(nextIndex);
		});

		if (snapTimeout.current) {
			window.clearTimeout(snapTimeout.current);
		}

		snapTimeout.current = window.setTimeout(() => {
			const targetIndex = getClosestIndex();
			setActiveIndex(targetIndex);
			snapToIndex(targetIndex);
		}, 140);
	};

	const handleItemClick = (index: number) => {
		setActiveIndex(index);
		snapToIndex(index);
	};

	return (
		<div
			ref={rootRef}
			className="relative grid h-screen w-full place-content-center grid-cols-1 gap-8 overflow-hidden px-6 pb-6 pt-4 lg:grid-cols-[1fr_1.1fr_1fr]"
		>
			{/* Full-screen background image */}
			<div
				className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: "url('/images/ProposalBoatPic.jpg')" }}
			/>
			{/* Dark overlay for readability */}
			<div className="absolute inset-0 -z-10 bg-black/40" />
			<h1 className="col-span-full text-center text-xl uppercase tracking-[0.35em] text-white/80 sm:text-2xl lg:col-span-3">
				Our Story
			</h1>
			<section className="flex items-center justify-center">
				<div
					key={activeIndex}
					className="fade-slide-in max-w-md text-center lg:text-left"
				>
					<p className="text-sm uppercase tracking-[0.3em] text-white/60">
						Story
					</p>
					<p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-white/90">
						{activeSlide?.shortText ?? ""}
					</p>
				</div>
			</section>

			<section className="relative flex items-center justify-center">
				<div className="relative h-[70vh] min-h-[420px] w-full max-w-md">
					<div
						ref={listRef}
						onScroll={handleScroll}
						className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto scroll-smooth"
					>
						<div style={{ height: spacerHeight }} />
						{slides.map((slide, index) => {
							const isActive = index === activeIndex;
							return (
								<div
									key={slide.id}
									ref={(el) => {
										itemRefs.current[index] = el;
									}}
									onClick={() => handleItemClick(index)}
									className={`flex h-14 snap-center items-center justify-center text-center transition-all duration-300 ${
										isActive
											? "scale-100 text-xl font-semibold text-white"
											: "scale-95 text-base text-white/50"
									}`}
								>
									{slide.headline}
								</div>
							);
						})}
						<div style={{ height: spacerHeight }} />
					</div>

					<div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent to-transparent" />
					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-transparent to-transparent" />
				</div>
			</section>

			<section className="flex items-center justify-center">
				<div key={activeIndex} className="fade-slide-in w-full max-w-3xl">
					{activeSlide?.imageUrl ? (
						<img
							src={activeSlide.imageUrl}
							alt={activeSlide.headline}
							className="h-[380px] w-full rounded-[28px] object-cover sm:h-[480px] md:h-[520px]"
							style={{ objectPosition: activeSlide.imagePosition ?? "center" }}
						/>
					) : (
						<div className="flex h-[380px] items-center justify-center border border-dashed border-white/40 text-sm uppercase tracking-[0.3em] text-white/60 sm:h-[480px] md:h-[520px]">
							Photo coming soon
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
