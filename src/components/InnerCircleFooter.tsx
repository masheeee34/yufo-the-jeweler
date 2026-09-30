'use strict';
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface InnerCircleFooterProps {
  onOpenModal: (subject?: string) => void;
}

export const InnerCircleFooter: React.FC<InnerCircleFooterProps> = ({ onOpenModal }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#050505] text-white pt-24 pb-14 px-6 sm:px-12 md:px-16 border-t border-white/10">
      <div className="max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-8 h-8">
                <Image
                  src="/assets/brand/yufo_clean_white.png"
                  alt="Yufo Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-light tracking-[-0.03em] text-white">YUFO THE JEWELRY</span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed max-w-xs font-light">
              Premier bespoke 3D jewelry atelier & FiveM skeletal rigging for the Los Santos elite.
            </p>
          </div>

          {/* Menu 1 */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase mb-5 text-white/90">Catalog</h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-light">
              <li>
                <a href="#featured" className="hover:text-white transition-colors">
                  Atelier 3D Masterpieces
                </a>
              </li>
              <li>
                <a href="#watches" className="hover:text-white transition-colors">
                  The Vault Timepieces
                </a>
              </li>
              <li>
                <a href="#essentials" className="hover:text-white transition-colors">
                  Specimens & Essentials
                </a>
              </li>
              <li>
                <a href="#bespoke" className="hover:text-white transition-colors">
                  1-of-1 Pipeline
                </a>
              </li>
            </ul>
          </div>

          {/* Menu 2 */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase mb-5 text-white/90">Commissions</h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-light">
              <li>
                <button
                  onClick={() => onOpenModal('Custom Atelier Commission')}
                  className="hover:text-white transition-colors text-left"
                >
                  Commission A 1-of-1 Piece
                </button>
              </li>
              <li>
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Discord VIP Server
                </a>
              </li>
              <li>
                <span className="text-white/40 text-xs font-light tracking-wide">.YDD / .YTD Files Ready</span>
              </li>
            </ul>
          </div>

          {/* Inner Circle Newsletter */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase mb-2 text-white/90">
              Yufo Private Roster
            </h4>
            <p className="text-xs text-white/60 mb-4 font-light">
              Get notified of monthly commission slot openings and private 1-of-1 asset drops.
            </p>
            {subscribed ? (
              <div className="text-xs text-white font-medium tracking-wider">
                ✓ WHITELISTED. WELCOME TO YUFO.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 p-1 bg-white/[0.04] border border-white/15 rounded-full focus-within:border-white/40 transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none flex-1 font-light"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-9 px-6 text-xs font-semibold uppercase tracking-wider bg-white text-black rounded-full hover:bg-neutral-200 transition-colors shrink-0"
                >
                  JOIN
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/50">
          <div>© {new Date().getFullYear()} YUFO THE JEWELRY. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
