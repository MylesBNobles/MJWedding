'use client';

import { storySlides } from '@/lib/mockData';

export default function StoryPage() {
  return (
    <div className="snap-container">
      {storySlides.map((slide, index) => (
        <section
          key={slide.id}
          className="snap-section relative flex items-center justify-center"
          style={{ background: slide.imageUrl }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
              {slide.headline}
            </h2>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              {slide.shortText}
            </p>
          </div>

          {/* Scroll indicator on first slide */}
          {index === 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
              <div className="flex flex-col items-center text-white/70">
                <span className="text-sm mb-2">Scroll</span>
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
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Slide indicator */}
          <div className="absolute bottom-8 right-8 text-white/50 text-sm">
            {index + 1} / {storySlides.length}
          </div>
        </section>
      ))}
    </div>
  );
}
