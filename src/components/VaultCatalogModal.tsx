'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { YUFO_PRODUCTS, CATEGORIES_NAV, ProductCategory, Product } from '../lib/products';
import { useCart } from '../lib/cartContext';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductCard } from './ProductCard';
import { IconSearch, IconX, IconCheck, IconArrowUpRight, IconShoppingBag } from '@tabler/icons-react';

interface VaultCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: ProductCategory;
  initialSearchQuery?: string;
  onOpenBespoke: () => void;
}

export const VaultCatalogModal: React.FC<VaultCatalogModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'all',
  initialSearchQuery = '',
  onOpenBespoke,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    if (isOpen) {
      if (initialCategory) setActiveCategory(initialCategory);
      if (initialSearchQuery !== undefined) setSearchTerm(initialSearchQuery);
    }
  }, [isOpen, initialCategory, initialSearchQuery]);

  if (!isOpen) return null;

  const filteredProducts = YUFO_PRODUCTS.filter((product) => {
    const matchesCat = activeCategory === 'all' || product.category === activeCategory;
    if (!matchesCat) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      product.name.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      product.reference.toLowerCase().includes(term) ||
      product.shortDescription.toLowerCase().includes(term) ||
      product.fullDescription.toLowerCase().includes(term)
    );
  });

  const handleAdd = (p: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    addToCart(p);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070709] text-white select-none overflow-hidden animate-fadeIn font-sans">
      
      {/* Top Header Bar */}
      <header className="h-16 sm:h-20 flex items-center justify-between px-6 sm:px-12 border-b border-white/10 bg-[#0a0a0d] flex-none gap-4">
        
        {/* Brand Left */}
        <div className="flex items-center gap-3">
          <div className="relative w-6 h-6">
            <Image
              src="/assets/brand/yufo_clean_white.png"
              alt="Yufo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.35em] text-white">
              YUFO THE VAULT
            </span>
            <span className="hidden md:inline-block text-[9px] font-mono text-zinc-500 uppercase tracking-widest px-2 py-0.5 border border-white/10">
              PERMANENT ALLOCATIONS
            </span>
          </div>
        </div>

        {/* Desktop Category Tabs */}
        <div className="hidden xl:flex items-center gap-1 border border-white/10 p-1 bg-black/40">
          {CATEGORIES_NAV.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Actions Right */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH VAULT..."
              className="w-32 sm:w-48 h-9 pl-8 pr-7 bg-black/60 border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white placeholder:text-white/30 focus:outline-none focus:border-white transition-all"
            />
            <IconSearch size={13} stroke={1.5} className="absolute left-2.5 text-white/40 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenBespoke();
            }}
            className="hidden sm:inline-flex items-center h-9 px-4 border border-white/25 bg-white/[0.03] text-white hover:bg-white hover:text-black font-mono text-[9px] font-medium uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Commission 1-of-1
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 border border-white/15 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-all cursor-pointer"
            aria-label="Close Vault Catalog"
          >
            <IconX size={15} stroke={1.5} />
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Category Tabs */}
      <div className="xl:hidden flex items-center gap-2 px-6 py-2.5 border-b border-white/10 overflow-x-auto scrollbar-none bg-[#09090b] flex-none">
        {CATEGORIES_NAV.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-none px-3.5 py-1.5 font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer border ${
              activeCategory === cat.id
                ? 'bg-white text-black font-semibold border-white'
                : 'bg-white/[0.02] text-white/60 border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid Content */}
      <main className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 bg-[#070709]">
        <div className="max-w-[1920px] mx-auto space-y-8">
          
          {/* Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-white/10 gap-3">
            <div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-1">
                HAUTE JOAILLERIE &amp; BESPOKE ASSETS
              </div>
              <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide uppercase">
                {activeCategory === 'all'
                  ? 'All Archival Releases'
                  : CATEGORIES_NAV.find((c) => c.id === activeCategory)?.label}
              </h2>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {filteredProducts.length} Piece{filteredProducts.length > 1 ? 's' : ''} Allocated · FiveM Ready
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <p className="text-sm font-mono uppercase tracking-[0.2em] text-white/50">
                No pieces found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                className="text-[10px] font-mono uppercase tracking-[0.2em] px-5 py-2.5 border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onOpen={() => setSelectedProduct(product)} />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Selected Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenBespoke={() => {
          setSelectedProduct(null);
          onClose();
          onOpenBespoke();
        }}
      />

    </div>
  );
};
