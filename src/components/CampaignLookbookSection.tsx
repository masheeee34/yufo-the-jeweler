'use strict';
'use client';

import React from 'react';
import Image from 'next/image';

interface CampaignLookbookSectionProps {
  onOpenConsultation: (subject?: string) => void;
}

export const CampaignLookbookSection: React.FC<CampaignLookbookSectionProps> = ({
  onOpenConsultation,
}) => {
  const LOOKBOOK_ITEMS = [
    {
      id: 'syndicate',
      title: 'The Syndicate Signature',
      subtitle: '3D Simulation Series · Multi-Ped Rigging',
      image: '/assets/media/campaign_crew_simulation.jpg',
      aspect: 'col-span-1 md:col-span-2',
      tag: 'FiveM Multiplayer Campaign',
    },
    {
      id: 'sovereign',
      title: 'Sovereign 1-of-1 Medallion',
      subtitle: '18K Yellow Gold & Dual Diamond Halo',
      image: '/assets/media/campaign_solo_medallion.jpg',
      aspect: 'col-span-1',
      tag: 'The Vault Allocation',
    },
    {
      id: 'memory',
      title: 'Memory Medallion & Gold Rope',
      subtitle: 'Protective Glass Lens Shader & Baguette Pavé',
      image: '/assets/media/campaign_portrait_medallion.jpg',
      aspect: 'col-span-1',
      tag: 'Bespoke Commission',
    },
  ];

  return (
    <section id="lookbook" className="py-24 px-6 sm:px-12 md:px-16 bg-[#070708] border-t border-white/10 select-none">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 mb-12 gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#c9aa6c] font-medium block mb-2">
              LOOKBOOK 2026 · LOS SANTOS
            </span>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tight">
              In-Game High Jewelry Editorial
            </h2>
            <p className="text-white/60 text-xs sm:text-sm font-light mt-2 max-w-xl">
              Captured directly inside GTA V & FiveM server environments. Realistic normal maps, metallic reflections, and zero vertex deformation.
            </p>
          </div>

          <button
            onClick={() => onOpenConsultation('Lookbook Custom Piece Request')}
            className="h-11 px-7 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all self-start md:self-auto"
          >
            Inquire Campaign Pieces
          </button>
        </div>

        {/* Editorial Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {LOOKBOOK_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`group relative rounded-3xl overflow-hidden border border-white/10 bg-black aspect-[16/10] ${item.aspect}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Text Callout */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-none">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c] font-medium">
                    {item.tag}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/70 font-light">
                    {item.subtitle}
                  </p>
                </div>

                <div className="hidden sm:block">
                  <span className="w-10 h-10 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center text-white text-sm group-hover:bg-white group-hover:text-black transition-all">
                    ↗
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
