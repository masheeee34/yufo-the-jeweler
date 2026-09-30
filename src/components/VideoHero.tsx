'use strict';
'use client';

import React from 'react';

interface VideoHeroProps {
  onInquire: (subject?: string) => void;
  onSellTrade: () => void;
}

export const VideoHero: React.FC<VideoHeroProps> = ({ onInquire, onSellTrade }) => {
  return (
    <section className="relative bg-[#050505] overflow-hidden min-h-[720px] lg:min-h-[88vh] flex items-center">
      {/* IN-GAME MONTAGE VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center"
          src="/assets/videos/yufo_hero_montage.mp4"
        />
        {/* Soft, cinematic Moses NYC gradients for video depth and pristine text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-64 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent pointer-events-none z-[2]" />
      </div>

      {/* REFINED MOSES NYC / SOTHEBY'S EDITORIAL HERO */}
      <div className="relative z-10 max-w-[1920px] mx-auto px-6 sm:px-12 md:px-16 w-full pt-36 sm:pt-44 pb-28 sm:pb-36">
        <div className="max-w-2xl">
          
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="text-xs uppercase tracking-[0.2em] text-white/70 font-medium">
              Haute Joaillerie Virtuelle · GTA V & FiveM
            </span>
          </div>

          {/* Main Title - Pure Quiet Luxury */}
          <h1 className="text-white text-3xl sm:text-5xl md:text-[54px] font-light tracking-[-0.03em] leading-[1.12]">
            Bespoke 3D Pieces With<br />
            <span className="font-serif italic text-white/95">The Yufo Atelier</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-white/75 text-base sm:text-xl font-light leading-relaxed max-w-xl">
            Pendentifs sur-mesure, chaînes diamantées et pièces d&apos;horlogerie d&apos;exception. Sculptés en 3D et articulés sur les squelettes de vos personnages FiveM.
          </p>

          {/* Action Buttons - Pure Luxury Rounded-Full Pills */}
          <div className="flex items-center gap-4 mt-10">
            <button
              onClick={() => onInquire('Bespoke 3D Commission')}
              className="inline-flex items-center justify-center h-12 px-8 text-xs font-semibold uppercase tracking-wider bg-white text-black rounded-full hover:bg-neutral-200 transition-all shadow-lg hover:scale-[1.02]"
            >
              Commission A Piece
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('featured');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center h-12 px-8 text-xs font-semibold uppercase tracking-wider border border-white/50 text-white rounded-full hover:bg-white hover:text-black transition-all"
            >
              Explore Atelier
            </button>
          </div>

          {/* Discreet Micro-Meta without typewriter font */}
          <div className="mt-12 pt-6 border-t border-white/10 flex items-center gap-6 sm:gap-8 text-xs font-normal tracking-wider text-white/45">
            <span>1-of-1 Commissions</span>
            <span className="text-white/20">·</span>
            <span className="hidden sm:inline">Zero Clipping Ped Rigs</span>
            <span className="hidden sm:inline text-white/20">·</span>
            <span className="hidden md:inline">Custom Specular Shaders</span>
          </div>

        </div>
      </div>
    </section>
  );
};
