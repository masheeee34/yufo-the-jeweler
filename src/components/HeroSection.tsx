'use strict';
'use client';

import React, { useRef, useState } from 'react';

export const HeroSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[90vh] sm:h-screen flex items-center justify-center overflow-hidden bg-black select-none pt-20">
      
      {/* 60 FPS Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src="/assets/videos/yufo_hero_montage.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70 pointer-events-none" />
      </div>

      {/* Hero Editorial Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-6">
        <span className="block text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#c9aa6c] font-medium drop-shadow-md">
          2026 COLLECTION · HAUTE JOAILLERIE
        </span>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light text-white tracking-wide leading-tight">
          Bespoke Virtual High Jewelry
        </h1>

        <p className="text-xs sm:text-sm text-white/80 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
          Curated iced-out timepieces, solid diamond chains, and 1-of-1 bespoke medallions rigged specifically for GTA V & FiveM player skeletons.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => scrollTo('collection')}
            className="h-12 px-8 rounded-full bg-white text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-xl hover:scale-[1.02]"
          >
            Explore Collection
          </button>
          <button
            onClick={() => scrollTo('bespoke-builder')}
            className="h-12 px-8 rounded-full border border-white/30 text-white text-xs font-semibold uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center"
          >
            Bespoke 1-of-1 Builder
          </button>
        </div>
      </div>

      {/* Video Controls (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-20 hidden sm:flex items-center gap-2.5">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-xs text-white/70 hover:text-white transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="w-8 h-8 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-xs text-white/70 hover:text-white transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Scroll Down Hint */}
      <button
        onClick={() => scrollTo('collection')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center text-white/60 hover:text-white transition-colors group cursor-pointer"
      >
        <span className="text-[10px] uppercase tracking-[0.25em] font-light">Explore</span>
        <span className="text-xs mt-1 animate-bounce">∨</span>
      </button>

    </section>
  );
};
