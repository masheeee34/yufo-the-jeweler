'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { useCart } from '../lib/cartContext';
import { ProductCategory } from '../lib/products';
import { SearchOverlay } from './SearchOverlay';
import {
  IconSearch,
  IconUser,
  IconShoppingBag,
} from '@tabler/icons-react';

interface LuxuryNavbarProps {
  onSelectCategory?: (category: ProductCategory) => void;
  onSearchQuery?: (query: string) => void;
  onOpenConsultation?: (subject?: string) => void;
  onOpenAccount: () => void;
  discordUrl?: string;
}

const DiscordSvg: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const LuxuryNavbar: React.FC<LuxuryNavbarProps> = ({
  onSelectCategory,
  onSearchQuery,
  onOpenConsultation,
  onOpenAccount,
  discordUrl = 'https://discord.gg',
}) => {
  const { user } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectCategory={(cat) => onSelectCategory && onSelectCategory(cat as ProductCategory)}
        onSearchSubmit={(query) => onSearchQuery && onSearchQuery(query)}
      />

      {/* Header 100% Transparent, ultra-épuré */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 sm:h-20 flex items-center justify-between px-6 sm:px-12 bg-transparent select-none pointer-events-none">
        
        {/* Left Navigation: Creations & Custom links */}
        <div className="flex items-center gap-6 sm:gap-8 text-white/80 pointer-events-auto">
          <Link
            href="/collections/shop-all"
            className="text-[13px] uppercase tracking-[0.08em] font-normal hover:text-white transition-colors"
          >
            Creations
          </Link>
          <Link
            href="/custom-orders"
            className="text-[13px] uppercase tracking-[0.08em] font-normal hover:text-white transition-colors"
          >
            Custom
          </Link>
        </div>

        {/* Right navigation — Discord + Account + Search */}
        <div className="flex items-center gap-5 sm:gap-7 text-white/80 drop-shadow-md pointer-events-auto">
          <a
            href={discordUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-white transition-all cursor-pointer group"
            aria-label="Discord Atelier Lounge"
          >
            <span className="group-hover:scale-110 transition-transform">
              <DiscordSvg size={15} />
            </span>
            <span className="hidden sm:inline text-[12px] uppercase tracking-[0.06em]">Discord</span>
          </a>

          {/* Allocations Bag / Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative hover:text-white hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center p-1"
            aria-label="Atelier Allocations Cart"
          >
            <IconShoppingBag size={18} stroke={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button
            onClick={onOpenAccount}
            className="relative hover:text-white hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center p-1"
            aria-label="Collector Account Portal"
          >
            <IconUser size={18} stroke={1.5} />
            {user && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hover:text-white hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center p-1"
            aria-label="Search Vault Archive"
          >
            <IconSearch size={18} stroke={1.5} />
          </button>
        </div>
      </header>
    </>
  );
};
