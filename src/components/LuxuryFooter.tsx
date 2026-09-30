'use strict';
'use client';

import React from 'react';
import Image from 'next/image';

export const LuxuryFooter: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/10 px-6 sm:px-12 md:px-16 py-16 text-white select-none">
      <div className="max-w-[1920px] mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6">
                <Image
                  src="/assets/brand/yufo_clean_white.png"
                  alt="Yufo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-sm font-light tracking-[0.35em] text-white uppercase">
                YUFO THE JEWELRY
              </span>
            </div>
            <p className="text-xs text-white/50 font-light max-w-md">
              Virtual High Jewelry, Horology & Bespoke 3D Skeletons for GTA V & FiveM RP servers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-xs text-white/60 uppercase tracking-[0.2em] font-sans font-light">
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              Discord VIP
            </a>
            <a
              href="#collection"
              className="hover:text-white transition-colors"
            >
              The Vault
            </a>
            <a
              href="#bespoke-builder"
              className="hover:text-white transition-colors"
            >
              Bespoke Builder
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              Back To Top ↑
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40 gap-4">
          <div>
            © {new Date().getFullYear()} YUFO THE JEWELRY. ALL RIGHTS RESERVED.
          </div>
          <div className="text-center sm:text-right text-[10px] text-white/30">
            Independent Virtual Atelier. Not affiliated with Rockstar Games, Take-Two Interactive, or Rolex SA.
          </div>
        </div>

      </div>
    </footer>
  );
};
