'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconX, IconSearch, IconArrowRight } from '@tabler/icons-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: string) => void;
  onSearchSubmit: (query: string) => void;
}

const QUICK_LINKS = [
  { label: 'All Pieces', cat: 'all' },
  { label: 'Haute Horlogerie', cat: 'watches' },
  { label: 'Chains & Busts', cat: 'chains' },
  { label: 'Pendants & Medallions', cat: 'pendants' },
];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onSearchSubmit,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit(query.trim());
      onClose();
    }
  };

  const handleQuickLink = (cat: string) => {
    onSelectCategory(cat);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col select-none font-sans"
      style={{ backgroundColor: 'rgba(5,5,7,0.96)', backdropFilter: 'blur(12px)' }}
    >
      {/* Close button */}
      <div className="flex justify-end px-6 sm:px-12 pt-6">
        <button
          onClick={onClose}
          className="w-9 h-9 border border-white/15 hover:border-white/50 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          aria-label="Close Search"
        >
          <IconX size={16} stroke={1.5} />
        </button>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12 max-w-2xl mx-auto w-full">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-zinc-500 mb-8 font-light">
          Search the Yufo Vault Archive
        </span>

        {/* Minimalist underlined search input */}
        <form onSubmit={handleSubmit} className="w-full flex items-center border-b border-white/20 pb-3 mb-10 group focus-within:border-white transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rolex, Patek, Diamond Chain, Medallion..."
            className="flex-1 bg-transparent text-white text-base sm:text-xl font-light tracking-wide placeholder:text-white/20 outline-none px-2 font-mono"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white/80 hover:text-white hover:border-white text-[10px] font-mono uppercase tracking-[0.2em] font-medium transition-all cursor-pointer"
            aria-label="Submit Search"
          >
            <IconSearch size={14} stroke={1.5} />
            <span>Search</span>
          </button>
        </form>

        {/* Category shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 font-mono">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.cat}
              onClick={() => handleQuickLink(link.cat)}
              className="px-3.5 py-1.5 border border-white/10 hover:border-white/35 bg-white/[0.02] text-zinc-400 hover:text-white text-[9px] uppercase tracking-[0.2em] transition-all cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
