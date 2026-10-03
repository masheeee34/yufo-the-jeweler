'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/authContext';
import { useCart } from '../lib/cartContext';
import { SearchOverlay } from './SearchOverlay';
import { UserMenu } from './UserMenu';
import { AnnouncementBar } from './AnnouncementBar';
import { DISCORD_INVITE } from './CustomProjectWizard';
import {
  IconSearch,
  IconShoppingBag,
  IconX,
  IconPlus,
  IconMinus,
  IconMessageCircle,
} from '@tabler/icons-react';

interface AlexMossHeaderProps {
  onOpenAccount?: () => void;
  onOpenSearch?: () => void;
  onOpenCart?: () => void;
  activeRoute?: 'shop' | 'custom' | 'home';
}

const DiscordSvg: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const AlexMossHeader: React.FC<AlexMossHeaderProps> = ({
  onOpenAccount,
  onOpenSearch,
  onOpenCart,
  activeRoute,
}) => {
  const { user } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [meganavOpen, setMeganavOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);

  const toggleMeganav = () => setMeganavOpen((prev) => !prev);

  return (
    <>
      <SearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
        onSelectCategory={() => {}}
        onSearchSubmit={() => {}}
      />

      <AnnouncementBar />

      {/* Main Luxury Header Bar */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#070709] border-b border-[#16161d] select-none transition-colors">
        <nav className="max-w-[1720px] mx-auto h-16 sm:h-20 flex items-center justify-between px-5 sm:px-10 lg:px-14" aria-label="Primary Atelier Navigation">
          
          {/* Left Column: Navigation links & Shop trigger */}
          <div className="flex items-center gap-6 lg:gap-8 text-[13px] uppercase tracking-[0.08em] font-normal">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-white/80 hover:text-white transition-colors"
              aria-label="Open Navigation Menu"
            >
              <svg width="20" height="14" viewBox="0 0 21 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1h19M1 7h19M1 13h19" strokeLinecap="round" />
              </svg>
            </button>

            {/* Shop + Button */}
            <button
              onClick={toggleMeganav}
              className={`hidden lg:flex items-center gap-2 transition-colors cursor-pointer ${
                meganavOpen || activeRoute === 'shop' ? 'text-white font-medium' : 'text-[#888888] hover:text-white'
              }`}
              aria-expanded={meganavOpen}
              aria-label="Shop Menu"
            >
              <span>Creations</span>
              {meganavOpen ? (
                <IconMinus size={13} stroke={1.5} className="text-white" />
              ) : (
                <IconPlus size={13} stroke={1.5} className="text-[#888888]" />
              )}
            </button>

            {/* Custom Orders Link */}
            <Link
              href="/custom-orders"
              className={`hidden lg:inline-block transition-colors cursor-pointer ${
                activeRoute === 'custom' ? 'text-white font-medium border-b border-white pb-0.5' : 'text-[#888888] hover:text-white'
              }`}
            >
              Custom
            </Link>

            {/* Collections Link */}
            <Link
              href="/collections/shop-all"
              className="hidden lg:inline-block text-[#888888] hover:text-white transition-colors cursor-pointer"
            >
              Collections
            </Link>
          </div>

          {/* Center Column: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="text-center group block cursor-pointer"
              aria-label="YUFO The Jeweler Home"
            >
              <span className="text-base sm:text-lg lg:text-xl tracking-[0.2em] uppercase font-normal text-white transition-opacity group-hover:opacity-80 block">
                YUFO THE JEWELER
              </span>
            </Link>
          </div>

          {/* Right Column: Actions (Discord, Concierge, Search, Account) */}
          <div className="flex items-center gap-4 sm:gap-6 text-[#999999]">
            {/* Discord Atelier Lounge */}
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 hover:text-white transition-all cursor-pointer group"
              aria-label="Discord Atelier Lounge"
            >
              <DiscordSvg size={14} />
              <span className="hidden md:inline text-[12px] uppercase tracking-[0.06em]">Discord</span>
            </a>

            {/* Search Button */}
            <button
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                else setSearchOverlayOpen(true);
              }}
              className="hover:text-white transition-all p-1 cursor-pointer"
              aria-label="Search Vault Archive"
            >
              <IconSearch size={18} stroke={1.5} />
            </button>

            {/* Cart / Allocations Bag Button */}
            <button
              onClick={() => {
                if (onOpenCart) onOpenCart();
                else setIsCartOpen(true);
              }}
              className="relative hover:text-white transition-all p-1 cursor-pointer flex items-center gap-1.5"
              aria-label="Atelier Allocations Cart"
            >
              <IconShoppingBag size={18} stroke={1.5} />
              {totalItems > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Account: Discord avatar + menu */}
            <UserMenu onOpenAccount={onOpenAccount} />
          </div>

        </nav>

        {/* Meganav Dropdown Panel (Identical structure to Alex Moss NY meganav — Zero Artificial Frames) */}
        {meganavOpen && (
          <div className="border-t border-[#16161d] bg-[#070709] text-white shadow-2xl select-none animate-in fade-in duration-150">
            <div className="max-w-[1720px] mx-auto px-6 sm:px-12 py-10 lg:py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              
              {/* Column 1: Category */}
              <div>
                <p className="text-[12px] uppercase tracking-[0.1em] text-[#666666] font-medium mb-4">
                  Category
                </p>
                <ul className="space-y-2.5 text-[14px] uppercase tracking-[0.04em]">
                  <li>
                    <Link
                      href="/collections/shop-all"
                      onClick={() => setMeganavOpen(false)}
                      className="text-white hover:text-white/70 transition-colors block font-medium"
                    >
                      All Creations
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?category=pendants"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      Pendants & Medallions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?category=chains"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      Chains & Necklaces
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?category=rings"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      Rings & Bands
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?category=watches"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      Timepieces
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?category=studs"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      Grillz & Studs
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Collections */}
              <div>
                <p className="text-[12px] uppercase tracking-[0.1em] text-[#666666] font-medium mb-4">
                  Collections
                </p>
                <ul className="space-y-2.5 text-[14px] uppercase tracking-[0.04em]">
                  <li>
                    <Link
                      href="/collections/shop-all?collection=cathedral-of-dreams"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      Cathedral of Dreams
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?collection=neo"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      NEO
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?collection=the-saint-mark"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      The Saint Mark
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/shop-all?collection=essence"
                      onClick={() => setMeganavOpen(false)}
                      className="text-[#999999] hover:text-white transition-colors block"
                    >
                      Essence
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: FiveM Architecture */}
              <div>
                <p className="text-[12px] uppercase tracking-[0.1em] text-[#666666] font-medium mb-4">
                  3D Engineering
                </p>
                <ul className="space-y-2.5 text-[13px] text-[#888888]">
                  <li>.YDD / .YTD Stream Ready</li>
                  <li>Zero-Tear Weight Painting</li>
                  <li>Refractive Specular Shaders</li>
                  <li>Universal Male & Female Skeletons</li>
                  <li className="pt-2">
                    <Link
                      href="/custom-orders"
                      onClick={() => setMeganavOpen(false)}
                      className="text-white hover:underline text-[12px] uppercase tracking-[0.06em]"
                    >
                      Commission 1-of-1 Piece →
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Featured Creation */}
              <div className="relative">
                <div className="relative aspect-square w-full mb-3 overflow-hidden bg-[#101015]">
                  <Image
                    src="/assets/media/campaign_solo_medallion.jpg"
                    alt="The Sovereign Medallion 1-of-1"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[11px] uppercase tracking-[0.06em] text-[#777777] block mb-0.5">
                  Signature Piece
                </span>
                <p className="text-[14px] text-white uppercase tracking-[0.02em]">
                  The Sovereign Medallion
                </p>
                <Link
                  href="/collections/shop-all"
                  onClick={() => setMeganavOpen(false)}
                  className="text-[12px] uppercase tracking-[0.06em] text-[#999999] hover:text-white mt-1 inline-block"
                >
                  Inspect Archive →
                </Link>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#070709] text-white p-6 flex flex-col justify-between lg:hidden animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-[#16161d]">
              <span className="text-[14px] tracking-[0.2em] uppercase text-white">YUFO ATELIER</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white/70 hover:text-white"
                aria-label="Close menu"
              >
                <IconX size={20} stroke={1.5} />
              </button>
            </div>

            <nav className="py-8 space-y-5 text-[15px] uppercase tracking-[0.06em]">
              <Link
                href="/collections/shop-all"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white"
              >
                Creations Archive
              </Link>
              <Link
                href="/custom-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-white"
              >
                Custom Orders
              </Link>
              <Link
                href="/collections/shop-all?category=pendants"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#888888] hover:text-white"
              >
                Pendants & Medallions
              </Link>
              <Link
                href="/collections/shop-all?category=chains"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#888888] hover:text-white"
              >
                Chains & Necklaces
              </Link>
              <Link
                href="/collections/shop-all?category=watches"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#888888] hover:text-white"
              >
                Timepieces
              </Link>
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noreferrer"
                className="block text-[#888888] hover:text-white"
              >
                Discord Lounge
              </a>
            </nav>
          </div>

          <div className="pt-6 border-t border-[#16161d] flex items-center justify-between text-[11px] text-[#555555] uppercase tracking-[0.1em]">
            <span>1-of-1 FiveM Joaillerie</span>
            <span>72H Turnaround</span>
          </div>
        </div>
      )}
    </>
  );
};
