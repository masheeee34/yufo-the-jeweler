'use strict';
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface YslLookbookSectionProps {
  onInquire: (subject?: string) => void;
}

export const YslLookbookSection: React.FC<YslLookbookSectionProps> = ({ onInquire }) => {
  const [revealedItems, setRevealedItems] = useState<Record<string, boolean>>({});
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-reveal-id');
          if (id) {
            setRevealedItems((prev) => ({ ...prev, [id]: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    });

    const elements = sectionRef.current?.querySelectorAll('[data-reveal-id]');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="lookbook"
      className="relative bg-[#050505] text-[#E3E3E3] py-28 sm:py-36 px-6 sm:px-12 md:px-16 overflow-hidden"
    >
      {/* Giant Ambient Studio Lighting Glows */}
      <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[650px] h-[650px] bg-white/[0.015] rounded-full blur-[180px] pointer-events-none" />

      {/* Atmospheric Editorial Watermarks in Background */}
      <div className="absolute top-12 left-0 right-0 overflow-hidden pointer-events-none select-none">
        <span className="block text-[14vw] font-serif uppercase tracking-[0.18em] text-white/[0.018] whitespace-nowrap leading-none text-center">
          HAUTE JOAILLERIE
        </span>
      </div>

      <div className="max-w-[1920px] mx-auto relative z-10">
        
        {/* Section Editorial Header */}
        <div 
          data-reveal-id="header"
          className={`mb-20 sm:mb-28 ysl-reveal-item ${revealedItems['header'] ? 'is-revealed' : ''}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-[1px] bg-white/40" />
            <span className="text-xs uppercase tracking-[0.3em] text-white/70 font-medium">
              EDITORIAL LOOKBOOK · COLLECTION 01
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-3xl leading-[1.1]">
              The High Fashion Runway Of{' '}
              <span className="font-serif italic font-normal text-white">FiveM Diamond Craft</span>
            </h2>
            <p className="text-white/50 text-xs sm:text-sm font-light max-w-md leading-relaxed">
              Every creation is sculpted as a 1-of-1 virtual haute horlogerie or high jewelry piece, articulated precisely for in-game ped skeletons with zero clipping.
            </p>
          </div>
        </div>

        {/* ACT 01: The Asymmetrical Sovereign Look (Filly Bust & Macro Specimen) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center mb-36 sm:mb-48">
          
          {/* Main Giant Look (60% Screen) with Curtain Reveal */}
          <div 
            data-reveal-id="act1-main"
            className={`lg:col-span-7 ysl-reveal-item ${revealedItems['act1-main'] ? 'is-revealed' : ''}`}
          >
            <div className="group relative w-full aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden bg-black/40 border border-white/10 transition-all duration-700 hover:border-white/30">
              
              {/* Studio Spotlight Glow behind piece */}
              <div className="absolute inset-0 bg-radial from-white/[0.08] via-transparent to-transparent blur-3xl pointer-events-none" />

              {/* Diamond Glint */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                <div className="diamond-glint w-32 h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[2px] opacity-0" />
              </div>

              {/* High-Poly Render Image */}
              <div className="relative w-full h-full p-8 sm:p-12">
                <Image
                  src="/assets/products/bust_filly.png"
                  alt="Filly Sovereign Necklace"
                  fill
                  className="object-contain transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)]"
                />
              </div>

              {/* High Fashion Look Tag */}
              <div className="absolute top-6 left-6 z-20">
                <span className="text-[11px] font-medium tracking-[0.25em] text-white/80 uppercase bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                  LOOK 01 · MASTERPIECE
                </span>
              </div>

              {/* Bottom Quick Action Pill */}
              <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="text-xs">
                  <div className="text-white font-medium">Filly Diamond Medallion</div>
                  <div className="text-white/50 text-[11px] font-light">18K Two-Tone · Round Brilliant VVS</div>
                </div>
                <button
                  onClick={() => onInquire('Commission Inquiry: Look 01 Filly Medallion')}
                  className="inline-flex items-center justify-center h-10 px-6 text-xs font-semibold uppercase tracking-wider bg-white text-black rounded-full hover:bg-neutral-200 transition-all shadow-xl hover:scale-[1.03]"
                >
                  Acquire Piece
                </button>
              </div>
            </div>
          </div>

          {/* Staggered Right Side: Editorial Metadata & Macro Detail Card */}
          <div 
            data-reveal-id="act1-side"
            className={`lg:col-span-5 space-y-10 lg:pl-6 ysl-reveal-item delay-200 ${revealedItems['act1-side'] ? 'is-revealed' : ''}`}
          >
            <div className="space-y-4">
              <span className="text-xs font-serif italic text-white/50">Runway Specimen No. 01</span>
              <h3 className="text-2xl sm:text-4xl font-serif font-light text-white leading-tight">
                Micro-Gemological Pavé & 3D Skeletal Rig
              </h3>
              <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed">
                Engineered directly from client 2D calligraphy into millions of micro-facets. Built with custom specular gloss maps so diamonds scintillate dynamically in Los Santos under streetlights and moonlight.
              </p>
            </div>

            {/* Macro Detail Lookbook Card */}
            <div className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0c0d0e] border border-white/10 p-6 flex items-center justify-center transition-all duration-500 hover:border-white/30">
              <div className="absolute inset-0 bg-radial from-white/[0.05] via-transparent to-transparent blur-xl pointer-events-none" />
              <Image
                src="/assets/products/filly_necklace_bust.png"
                alt="Filly Necklace Macro Detail"
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
              <div className="absolute bottom-4 left-4 z-10 text-[10px] uppercase tracking-wider text-white/60 font-medium bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                100% In-Game Weighted
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onInquire('Custom Blueprint Consultation')}
                className="inline-flex items-center justify-center h-11 px-8 text-xs font-semibold uppercase tracking-wider border border-white/40 text-white rounded-full hover:bg-white hover:text-black transition-all hover:scale-[1.02]"
              >
                Inspect Atelier Blueprint
              </button>
            </div>
          </div>

        </div>

        {/* ACT 02: The Horological Duet (Floating Bustdown Timepieces with Vitrine Halos) */}
        <div className="mb-36 sm:mb-48">
          
          <div 
            data-reveal-id="act2-header"
            className={`text-center max-w-2xl mx-auto mb-16 ysl-reveal-item ${revealedItems['act2-header'] ? 'is-revealed' : ''}`}
          >
            <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
              LOOK 02 · HOROLOGICAL DUET
            </span>
            <h3 className="text-2xl sm:text-4xl font-serif font-light text-white mt-2">
              The Vault Private Allocations
            </h3>
            <p className="text-xs text-white/50 font-light mt-3">
              Sculpted chronographs and perpetual calibers, calibrated to fit ped wrists with realistic specular reflections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Watch: Rolex Datejust 41 Iced Out */}
            <div 
              data-reveal-id="act2-watch1"
              onClick={() => onInquire('Watch Inquiry: Rolex Datejust 41 Iced Out (Ref. 126334)')}
              className={`group cursor-pointer ysl-reveal-item ${revealedItems['act2-watch1'] ? 'is-revealed' : ''}`}
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden flex items-center justify-center p-8 bg-black/30 border border-white/[0.08] group-hover:border-white/30 transition-all duration-700">
                
                {/* Spotlight Vitrine Halo */}
                <div className="absolute inset-0 bg-radial from-white/[0.08] via-transparent to-transparent rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Diamond Glint */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="diamond-glint w-28 h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[2px] opacity-0" />
                </div>

                <Image
                  src="/assets/products/rolex_datejust_41.png"
                  alt="Rolex Datejust 41 Iced Out"
                  fill
                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)]"
                />

                <div className="absolute top-6 right-6">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Ref. 126334</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/50">Rolex</div>
                    <div className="text-white text-base font-normal">Datejust 41 Full Iced</div>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-semibold shadow-lg group-hover:scale-110 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </div>

            {/* Right Watch: Rolex Day-Date 40 Yellow Gold Bustdown (Staggered Lower) */}
            <div 
              data-reveal-id="act2-watch2"
              onClick={() => onInquire('Watch Inquiry: Rolex Day-Date 40 Yellow Gold Bustdown (Ref. 228238)')}
              className={`group cursor-pointer md:translate-y-16 ysl-reveal-item delay-150 ${revealedItems['act2-watch2'] ? 'is-revealed' : ''}`}
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden flex items-center justify-center p-8 bg-black/30 border border-white/[0.08] group-hover:border-white/30 transition-all duration-700">
                
                {/* Spotlight Warm Vitrine Halo */}
                <div className="absolute inset-0 bg-radial from-amber-200/[0.06] via-transparent to-transparent rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Diamond Glint */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="diamond-glint w-28 h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[2px] opacity-0" />
                </div>

                <Image
                  src="/assets/products/rolex_daydate_yellow.png"
                  alt="Rolex Day-Date 40 Yellow Gold Bustdown"
                  fill
                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_30px_60px_rgba(0,0,0,0.95)]"
                />

                <div className="absolute top-6 right-6">
                  <span className="text-[10px] uppercase tracking-wider text-white/50 font-medium">Ref. 228238</span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/50">Rolex</div>
                    <div className="text-white text-base font-normal">Day-Date 40 Bustdown</div>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-xs font-semibold shadow-lg group-hover:scale-110 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ACT 03: The Staggered Triptych (Ivan, Lom & Diamond Chains) */}
        <div className="mt-40">
          
          <div 
            data-reveal-id="act3-header"
            className={`flex flex-col sm:flex-row sm:items-end justify-between mb-16 pb-6 border-b border-white/10 ysl-reveal-item ${revealedItems['act3-header'] ? 'is-revealed' : ''}`}
          >
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-medium">
                LOOK 03 · PED ARCHIVE
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-light text-white mt-2">
                The Atelier Custom Sculptures
              </h3>
            </div>
            <div className="text-xs text-white/50 font-light mt-4 sm:mt-0">
              Allocated 1-of-1 creations streamed for GTA V FiveM
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            
            {/* Card 1: Ivan Piece */}
            <div 
              data-reveal-id="act3-c1"
              onClick={() => onInquire('Commission Inquiry: Ivan Diamond Pendant')}
              className={`group cursor-pointer ysl-reveal-item ${revealedItems['act3-c1'] ? 'is-revealed' : ''}`}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-black/40 border border-white/[0.08] group-hover:border-white/30 transition-all duration-500 p-6 flex flex-col justify-between">
                <div className="absolute inset-0 bg-radial from-white/[0.06] via-transparent to-transparent blur-xl pointer-events-none" />
                <div className="text-[11px] text-white/50 uppercase tracking-widest font-medium">SPECIMEN · 01</div>
                
                <div className="relative w-full h-3/5 my-auto">
                  <Image
                    src="/assets/products/bust_ivan.png"
                    alt="Ivan Pendant"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>

                <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white text-base font-normal">Ivan Signature</h4>
                    <p className="text-white/50 text-xs font-light">Custom Font · Diamond Pavé</p>
                  </div>
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">
                    Commission →
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Lom Piece (Staggered Delay) */}
            <div 
              data-reveal-id="act3-c2"
              onClick={() => onInquire('Commission Inquiry: Lom Medallion Set')}
              className={`group cursor-pointer ysl-reveal-item delay-150 md:translate-y-8 ${revealedItems['act3-c2'] ? 'is-revealed' : ''}`}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-black/40 border border-white/[0.08] group-hover:border-white/30 transition-all duration-500 p-6 flex flex-col justify-between">
                <div className="absolute inset-0 bg-radial from-white/[0.06] via-transparent to-transparent blur-xl pointer-events-none" />
                <div className="text-[11px] text-white/50 uppercase tracking-widest font-medium">SPECIMEN · 02</div>
                
                <div className="relative w-full h-3/5 my-auto">
                  <Image
                    src="/assets/products/bust_lom.png"
                    alt="Lom Medallion Set"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>

                <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white text-base font-normal">Lom Medallion Set</h4>
                    <p className="text-white/50 text-xs font-light">Yellow Gold · Double Cuban</p>
                  </div>
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">
                    Commission →
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Patek Nautilus */}
            <div 
              data-reveal-id="act3-c3"
              onClick={() => onInquire('Commission Inquiry: Patek Nautilus 5980')}
              className={`group cursor-pointer ysl-reveal-item delay-300 md:translate-y-16 ${revealedItems['act3-c3'] ? 'is-revealed' : ''}`}
            >
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-black/40 border border-white/[0.08] group-hover:border-white/30 transition-all duration-500 p-6 flex flex-col justify-between">
                <div className="absolute inset-0 bg-radial from-white/[0.06] via-transparent to-transparent blur-xl pointer-events-none" />
                <div className="text-[11px] text-white/50 uppercase tracking-widest font-medium">SPECIMEN · 03</div>
                
                <div className="relative w-full h-3/5 my-auto">
                  <Image
                    src="/assets/products/patek_nautilus_5980.png"
                    alt="Patek Nautilus 5980"
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  />
                </div>

                <div className="border-t border-white/[0.08] pt-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white text-base font-normal">Patek Nautilus 5980</h4>
                    <p className="text-white/50 text-xs font-light">Rose Gold · Chronograph</p>
                  </div>
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">
                    Commission →
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
