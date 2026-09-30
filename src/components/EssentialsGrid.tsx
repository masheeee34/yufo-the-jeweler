'use strict';
'use client';

import React from 'react';
import Image from 'next/image';
import { ESSENTIALS_CATEGORIES } from '../lib/catalog';

interface EssentialsGridProps {
  onInquire: (subject?: string) => void;
}

const SPECIMEN_DATA = [
  {
    id: 'chains',
    number: '01',
    name: 'CUBAN & ROPE CHAINS',
    subtitle: 'Heavy 18K Solid Links · Precision Rigged',
    desc: 'Articulated link geometry rigged directly to ped clavicle and neck skeleton with zero clipping through hoodies and collars.',
    image: '/assets/products/category_chains.png',
  },
  {
    id: 'pendants',
    number: '02',
    name: 'BESPOKE PENDANTS',
    subtitle: 'Custom Diamond Medallions & Logos',
    desc: '3D volumetry sculpted from vector concepts with multi-layer diamond pavé and custom in-game specular maps.',
    image: '/assets/products/category_pendants.png',
  },
  {
    id: 'rings',
    number: '03',
    name: 'SOLITAIRE & BAGUETTE RINGS',
    subtitle: '18K Yellow, Rose & White Gold',
    desc: 'Fitted to ped finger bone hierarchies with realistic diamond dispersion shaders reflecting sunlight.',
    image: '/assets/products/category_rings.png',
  },
  {
    id: 'grillz',
    number: '04',
    name: 'DIAMOND GRILLZ & STUDS',
    subtitle: 'Deep-Cut Dental Pavé & Solitaires',
    desc: 'Custom rigged to ped facial animation morphs so teeth shine during speech and custom emotes.',
    image: '/assets/products/category_studs.png',
  },
];

export const EssentialsGrid: React.FC<EssentialsGridProps> = ({ onInquire }) => {
  return (
    <section id="essentials" className="py-24 px-6 sm:px-12 md:px-16 bg-[#050505] border-t border-white/[0.06]">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <span className="text-xs uppercase tracking-[0.2em] text-white/60 font-medium">
                The Collection · Architectural Specimens
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-light tracking-[-0.03em] uppercase">
              Jewelry Essentials
            </h2>
            <p className="text-white/60 text-sm sm:text-base font-serif italic mt-2">
              Signature custom creations designed and engineered by Yufo.
            </p>
          </div>

          <div className="text-xs uppercase tracking-[0.2em] text-white/50 font-medium">
            Archive · 4 Specimens
          </div>
        </div>

        {/* Asymmetric Exhibition Layout (2+2 Architectural Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SPECIMEN_DATA.map((specimen) => (
            <div
              key={specimen.id}
              onClick={() => onInquire(`Jewelry Essentials: ${specimen.name}`)}
              className="group cursor-pointer flex flex-col justify-between"
            >
              {/* Image Frame with Museum Glow */}
              <div className="w-full aspect-[4/5] bg-[#111213]/40 border border-white/[0.06] group-hover:border-white/30 rounded-2xl overflow-hidden flex items-center justify-center p-8 relative transition-all duration-500">
                <Image
                  src={specimen.image}
                  alt={specimen.name}
                  fill
                  className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                />
                
                {/* Specimen Badge */}
                <div className="absolute top-4 left-4 text-[11px] font-medium text-white/50 uppercase tracking-wider">
                  Specimen · {specimen.number}
                </div>
              </div>

              {/* Caption & Specs */}
              <div className="mt-5 space-y-2 border-t border-white/[0.08] pt-4">
                <h3 className="text-white text-base sm:text-lg font-normal tracking-tight group-hover:text-white transition-colors">
                  {specimen.name}
                </h3>
                <p className="text-white/70 text-xs font-serif italic">
                  {specimen.subtitle}
                </p>
                <p className="text-white/45 text-xs font-light leading-relaxed pt-1">
                  {specimen.desc}
                </p>

                <div className="pt-2">
                  <span className="text-white/70 group-hover:text-white text-xs font-medium uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors">
                    Inquire Specimen <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
