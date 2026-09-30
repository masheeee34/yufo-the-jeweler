'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface NavbarProps {
  onOpenConsultation: (subject?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConsultation }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-black/80'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 sm:px-12 max-w-[1920px] mx-auto h-20">
        {/* Brand Logo & Wordmark */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/assets/brand/yufo_clean_white.png"
              alt="Yufo Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl sm:text-2xl font-light text-white tracking-[-0.03em] whitespace-nowrap">
            YUFO THE JEWELRY
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
          <a href="#featured" className="hover:text-white transition-colors">
            Custom Atelier
          </a>
          <a href="#watches" className="hover:text-white transition-colors">
            Watches
          </a>
          <a href="#lookbook" className="hover:text-white transition-colors">
            Runway Lookbook
          </a>
          <a href="#bespoke" className="hover:text-white transition-colors">
            Bespoke Creation
          </a>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onOpenConsultation('Custom 3D Commission')}
            className="inline-flex items-center justify-center h-10 px-6 text-xs font-semibold uppercase tracking-wider border border-white/60 text-white rounded-full hover:bg-white hover:text-black transition-all duration-300 hidden sm:inline-flex"
          >
            CONSULTATION
          </button>

          <a
            href="https://discord.gg"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-white/80 hover:text-white transition-colors"
            title="Discord"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden bg-[#121314] border-b border-[#242628] px-6 py-6 space-y-4">
          <a
            href="#featured"
            onClick={() => setIsMobileOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-white py-1"
          >
            Custom Atelier
          </a>
          <a
            href="#watches"
            onClick={() => setIsMobileOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-white py-1"
          >
            Watches
          </a>
          <a
            href="#lookbook"
            onClick={() => setIsMobileOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-white py-1"
          >
            Runway Lookbook
          </a>
          <a
            href="#bespoke"
            onClick={() => setIsMobileOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-white py-1"
          >
            Bespoke Creation
          </a>
          <button
            onClick={() => {
              setIsMobileOpen(false);
              onOpenConsultation('Custom 3D Commission');
            }}
            className="w-full inline-flex items-center justify-center h-10 text-xs font-semibold uppercase tracking-wider border border-white/60 text-white rounded-full hover:bg-white hover:text-black transition-colors !mt-4"
          >
            Book Consultation
          </button>
        </div>
      )}
    </header>
  );
};
