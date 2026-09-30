'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroProps {
  onInquire: (subject?: string) => void;
  onExploreCatalog?: () => void;
}

interface PieceSpec {
  metal: string;
  diamonds: string;
  chain: string;
  compatibility: string;
}

interface ShowcasePiece {
  id: string;
  name: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  watermark: string;
  specs: PieceSpec;
}

const PIECES: ShowcasePiece[] = [
  {
    id: 'filly',
    name: 'FILLY',
    number: '01',
    title: 'FILLY NECKLACE',
    subtitle: 'Exclusive 18K Pendant & Diamond Cuban Link Set',
    description: 'A monumental two-tone creation sculpted for GTA V MP characters. Features double-row pavé round brilliant diamonds and precision-weighted Cuban links that contour flawlessly across ped clothing meshes.',
    image: '/assets/products/bust_filly.png',
    watermark: 'FILLY',
    specs: {
      metal: '18K Rose & White Gold · Mirror Polish',
      diamonds: '75.00 ctw · Round Brilliant VVS',
      chain: '18K White Gold Micro-Rigged Cuban',
      compatibility: 'MP Ped Rigged · Zero Mesh Clipping',
    },
  },
  {
    id: 'lom',
    name: 'LOM',
    number: '02',
    title: 'LOM NECKLACE',
    subtitle: 'Loyalty Over Money · Two-Tone Baguette Masterpiece',
    description: 'Engineered with seamless channel-set baguette diamonds framed by round brilliant stones. Rigged to the neck and clavicle bones with custom in-game specular reflection maps for maximum shine under streetlights.',
    image: '/assets/products/bust_lom.png',
    watermark: 'LOM',
    specs: {
      metal: 'Solid 18K Yellow Gold · Satin Bezel',
      diamonds: '72.00 ctw · Baguette & Round FL',
      chain: 'Two-Tone Rose & Yellow Cuban',
      compatibility: 'Dynamic GTA V Shaders · Multi-LOD',
    },
  },
  {
    id: 'ivan',
    name: 'IVAN',
    number: '03',
    title: 'IVAN PENDANT',
    subtitle: 'Bespoke 3D Dual-Tone Diamond Script Nameplate',
    description: 'Custom script typography hand-paved with micro-pavé round diamonds on dual 18K gold layers. Articulated on a heavy rope chain with authentic physics simulation for high-speed vehicle escapes.',
    image: '/assets/products/bust_ivan.png',
    watermark: 'IVAN',
    specs: {
      metal: '18K Rose & White Gold Dual Layer',
      diamonds: '45.00 ctw · Flawless Round-Cut',
      chain: '18K Yellow Gold Heavy Rope Chain',
      compatibility: 'Bone Attachment · LOD0-LOD2 Stream',
    },
  },
];

export const Hero: React.FC<HeroProps> = ({ onInquire }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const changePiece = (idx: number) => {
    if (idx === currentIdx || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setIsTransitioning(false);
    }, 350);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % PIECES.length);
        setIsTransitioning(false);
      }, 350);
    }, 8500);
    return () => clearInterval(timer);
  }, [currentIdx, isTransitioning]);

  const current = PIECES[currentIdx];

  return (
    <section className="relative bg-[#050505] overflow-hidden py-24 lg:py-32 select-none border-b border-white/[0.06]">
      
      {/* 1. CINEMATIC WATERMARK TYPOGRAPHY IN BACKGROUND */}
      <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none overflow-hidden">
        <span
          key={current.watermark}
          className="text-[140px] sm:text-[220px] md:text-[320px] lg:text-[400px] font-light tracking-widest text-white/[0.018] uppercase transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] select-none"
        >
          {current.watermark}
        </span>
      </div>

      {/* 2. SUBTLE AMBIENT SPOTLIGHT */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-[1920px] mx-auto px-6 sm:px-12 md:px-16">
        
        {/* TOP EDITORIAL METADATA BAR */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="relative w-5 h-5">
              <Image
                src="/assets/brand/yufo_clean_white.png"
                alt="Yufo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-medium">
              Exhibition Archive · Pièce {current.number}
            </span>
          </div>

          <div className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-medium">
            Yufo Atelier · GTA V & FiveM
          </div>
        </div>

        {/* ASYMMETRIC MUSEUM LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT COLUMN: EDITORIAL SPECIFICATION DOSSIER (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            
            <div className="space-y-4">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium block">
                Création {current.number} / 03
              </span>
              
              <h2
                className={`text-white text-3xl sm:text-5xl md:text-6xl font-light tracking-[-0.03em] uppercase leading-[1.08] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isTransitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
                }`}
              >
                {current.title}
              </h2>

              <p
                className={`text-white/70 text-sm sm:text-base font-serif italic leading-relaxed pt-1 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {current.subtitle}
              </p>

              <p
                className={`text-white/50 text-xs sm:text-sm font-light leading-relaxed pt-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {current.description}
              </p>
            </div>

            {/* MINIMALIST EDITORIAL METRIC MATRIX */}
            <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
              
              <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
                  01 · 3D High-Poly Sculpt
                </span>
                <span className="text-white text-xs sm:text-sm font-normal tracking-tight text-right">
                  {current.specs.metal}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
                  02 · VVS Gemological Pavé
                </span>
                <span className="text-white text-xs sm:text-sm font-normal tracking-tight text-right">
                  {current.specs.diamonds}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-3">
                <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
                  03 · Ped Skeleton Rigging
                </span>
                <span className="text-white text-xs sm:text-sm font-normal tracking-tight text-right">
                  {current.specs.chain}
                </span>
              </div>

              <div className="flex items-baseline justify-between pb-2">
                <span className="text-xs uppercase tracking-wider text-white/50 font-medium">
                  04 · Dynamic In-Game Shaders
                </span>
                <span className="text-white text-xs sm:text-sm font-normal tracking-tight text-right">
                  {current.specs.compatibility}
                </span>
              </div>

            </div>

            {/* ACTIONS & COMMISSIONS - ROUNDED-FULL PILLS */}
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={() => onInquire(`Bespoke Commission: ${current.title}`)}
                className="inline-flex items-center justify-center h-12 px-8 text-xs font-semibold uppercase tracking-wider bg-white text-black rounded-full hover:bg-neutral-200 transition-all shadow-lg hover:scale-[1.02]"
              >
                Commission This Piece
              </button>
              <button
                onClick={() => onInquire('Custom 1-of-1 Blueprint')}
                className="inline-flex items-center justify-center h-12 px-8 text-xs font-semibold uppercase tracking-wider border border-white/50 text-white rounded-full hover:bg-white hover:text-black transition-all"
              >
                Custom Blueprint
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: MONUMENTAL BUST SCENOGRAPHY (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center order-1 lg:order-2 relative">
            
            <div className="relative w-full aspect-[4/5] max-w-[480px] sm:max-w-[560px] md:max-w-[620px] flex items-center justify-center">
              <Image
                key={current.image}
                src={current.image}
                alt={current.title}
                fill
                priority
                className={`object-contain drop-shadow-[0_35px_80px_rgba(0,0,0,0.98)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isTransitioning ? 'opacity-0 scale-[0.96] translate-y-3' : 'opacity-100 scale-100 translate-y-0'
                }`}
              />
            </div>

            {/* MINIMALIST CHAPTER RUNWAY SELECTOR */}
            <div className="mt-6 flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full p-1.5">
              {PIECES.map((piece, idx) => (
                <button
                  key={piece.id}
                  onClick={() => changePiece(idx)}
                  className={`px-5 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-500 ${
                    currentIdx === idx
                      ? 'bg-white text-black shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {piece.number} {piece.name}
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
