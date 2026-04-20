'use client';

import { useState, useEffect, useRef } from 'react';

export default function TestimonialSlider({ testimonials }) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isAutoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isAutoPlay, testimonials.length]);

  const goTo = (index) => {
    setCurrent(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 10000);
  };

  const prev = () => goTo((current - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((current + 1) % testimonials.length);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star text-lg ${i < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="relative">
      {/* Cards Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {testimonials.map((t) => (
            <div key={t.id} className="w-full flex-shrink-0 px-4">
              <div className="testimonial-card max-w-2xl mx-auto bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-pink-100/50 text-center">
                {/* Avatar */}
                <div className="text-5xl mb-4">{t.avatar}</div>

                {/* Stars */}
                <div className="flex justify-center gap-1 mb-4">
                  {renderStars(t.rating)}
                </div>

                {/* Review */}
                <p className="text-charcoal/70 leading-relaxed mb-6 text-sm md:text-base italic">
                  &ldquo;{t.review}&rdquo;
                </p>

                {/* Name & Date */}
                <p className="font-serif text-lg font-bold text-charcoal">
                  {t.name}
                </p>
                <p className="text-xs text-charcoal/40 uppercase tracking-wider mt-1">
                  {t.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-charcoal/50 hover:text-pink-default hover:shadow-lg transition-all z-10"
        aria-label="Previous"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-charcoal/50 hover:text-pink-default hover:shadow-lg transition-all z-10"
        aria-label="Next"
      >
        ›
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current
                ? 'bg-gradient-to-r from-pink-default to-rose w-6'
                : 'bg-pink-200 hover:bg-pink-300'
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
