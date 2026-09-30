'use strict';
'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { WATCH_VAULT, WatchProduct } from '../lib/catalog';

interface WatchCarouselProps {
  onSelectWatch: (watch: WatchProduct) => void;
  onInquireWatch: (watch: WatchProduct) => void;
}

export const WatchCarousel: React.FC<WatchCarouselProps> = ({ onInquireWatch }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (delta: number) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  return (
    <section id="watches" className="py-24 bg-[#050505] border-t border-white/[0.06] select-none">
      <div className="max-w-[1920px] mx-auto px-6 sm:px-12 md:px-16">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium">
                The Vault · Horological Allocations
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] uppercase">
              Curated Timepieces
            </h2>
            <p className="text-white/60 text-sm sm:text-base font-serif italic mt-2">
              Custom 3D iced-out watches and rare allocations rigged for FiveM collectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll(-420)}
              className="w-12 h-12 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors text-lg"
              aria-label="Previous timepiece"
            >
              ‹
            </button>
            <button
              onClick={() => scroll(420)}
              className="w-12 h-12 rounded-full border border-white/20 hover:border-white text-white flex items-center justify-center transition-colors text-lg"
              aria-label="Next timepiece"
            >
              ›
            </button>
          </div>
        </div>

        {/* Horizontal Continuous Lookbook Ribbon */}
        <div
          ref={sliderRef}
          className="flex gap-8 sm:gap-10 overflow-x-auto scrollbar-none pb-6 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {WATCH_VAULT.map((watch) => (
            <div
              key={watch.id}
              onClick={() => onInquireWatch(watch)}
              className="flex-none w-[300px] sm:w-[340px] md:w-[380px] group cursor-pointer flex flex-col justify-between"
            >
              {/* Product Visual Container - Floating Vitrine on Seamless Black */}
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden flex items-center justify-center p-6 relative transition-all duration-700 group-hover:translate-y-[-6px]">
                {/* Vitrine Spotlight Radial Glow */}
                <div className="absolute inset-0 bg-radial from-white/[0.09] via-white/[0.015] to-transparent rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Pedestal Ground Shadow */}
                <div className="absolute bottom-6 w-3/5 h-6 bg-black/90 blur-xl rounded-full pointer-events-none" />

                {/* Shimmer Glint */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="diamond-glint w-24 h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[2px] opacity-0" />
                </div>

                <Image
                  src={watch.image}
                  alt={`${watch.brand} ${watch.name}`}
                  fill
                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)]"
                />
                
                {/* Subtle Hover Pill */}
                <div className="absolute bottom-4 left-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="w-full py-2.5 bg-white text-black text-[11px] font-semibold uppercase tracking-wider rounded-full text-center shadow-2xl">
                    Private Allocation
                  </div>
                </div>
              </div>

              {/* Editorial Watch Details */}
              <div className="mt-5 space-y-1.5 border-t border-white/[0.08] pt-4">
                <div className="flex items-center justify-between text-xs text-white/50 tracking-wider uppercase font-medium">
                  <span>{watch.brand}</span>
                  <span>Ref. {watch.reference}</span>
                </div>

                <h3 className="text-white text-base sm:text-lg font-normal tracking-tight group-hover:text-white transition-colors">
                  {watch.name}
                </h3>

                <p className="text-white/60 text-xs font-light line-clamp-1">
                  {watch.caseSize} · {watch.material} · {watch.dial}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
