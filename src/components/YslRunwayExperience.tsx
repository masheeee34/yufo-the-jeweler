'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCategory } from '../lib/products';

interface YslRunwayExperienceProps {
  onOpenConsultation?: (subject?: string) => void;
  onOpenCatalog?: (category?: ProductCategory) => void;
  onOpenBespokeWizard?: () => void;
}

export const YslRunwayExperience: React.FC<YslRunwayExperienceProps> = ({
  onOpenConsultation,
  onOpenCatalog,
  onOpenBespokeWizard,
}) => {
  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-black text-white select-none">

      {/* IMAGE FOND HERO */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/assets/media/campaign_crew_simulation.jpg"
          alt="YUFO The Jeweler Campaign"
          fill
          priority
          quality={95}
          className="object-cover object-center scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/60 pointer-events-none" />
      </div>

      {/* CONTENU CENTRÉ HERO */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">

        {/* Surtitre */}
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.42em] text-white/60 font-medium mb-5 sm:mb-7">
          Built Around Your Vision
        </span>

        {/* Titre principal */}
        <h1
          className="font-serif font-light text-white leading-none tracking-[0.05em] mb-5 sm:mb-6"
          style={{ fontSize: 'clamp(2rem, 7.5vw, 5rem)', textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
        >
          YUFO THE JEWELER
        </h1>

        {/* Sous-titre */}
        <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/70 font-light mb-10 sm:mb-12">
          Your destination for high-quality jewelry
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto max-w-xs sm:max-w-none font-mono">
          {/* Bouton Explore the collection */}
          <Link
            href="/collections/shop-all"
            className="h-11 sm:h-12 w-full sm:w-auto px-9 border border-white text-white bg-transparent backdrop-blur-sm hover:bg-white hover:text-black text-[10px] uppercase tracking-[0.28em] font-semibold transition-all duration-300 flex items-center justify-center cursor-pointer"
          >
            Explore the collection
          </Link>

          {/* Bouton Start a new project */}
          <Link
            href="/custom-orders"
            className="h-11 sm:h-12 w-full sm:w-auto px-8 flex items-center justify-center gap-2 text-white/85 hover:text-white text-[10px] uppercase tracking-[0.25em] font-medium transition-colors cursor-pointer group"
          >
            <span>Start a new project</span>
            <span className="group-hover:translate-x-1.5 transition-transform duration-200 inline-block font-sans">→</span>
          </Link>
        </div>
      </div>

    </div>
  );
};
