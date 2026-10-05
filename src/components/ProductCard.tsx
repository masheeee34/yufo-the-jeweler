'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import type { Product } from '../lib/products';
import { useCart } from '../lib/cartContext';

// Carte produit (modèle « Series 8 watch » de Spectrum UI), avec un visuel plus haut que l'original (carré au lieu de 4:3).
export function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const badge = product.tags?.some((t) => /^new$/i.test(t)) ? 'New' : product.featured ? 'Featured' : null;
  const soldOut = product.inStock === false;

  const add = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (soldOut) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && (e.preventDefault(), onOpen())}
      tabIndex={0}
      aria-label={product.name}
      className="group/product w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-white shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-colors hover:border-white/20"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.14),transparent_65%)]" />
        <div className="relative size-full transition-transform duration-300 ease-out group-hover/product:scale-[1.04]">
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-5 sm:p-7" />
        </div>
        {badge && <span className="absolute left-3 top-3 rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-white">{badge}</span>}
        {soldOut && <span className="absolute right-3 top-3 rounded-md bg-black/70 px-2.5 py-0.5 text-xs font-semibold text-zinc-300">Sold out</span>}
      </div>
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="mt-0.5 truncate text-xs text-zinc-400">{product.specs?.material || product.brand}</p>
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums">{product.priceDisplay}</span>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={soldOut}
          className={`mt-4 w-full h-9 rounded-md text-sm font-medium transition-transform active:scale-[0.96] inline-flex items-center justify-center gap-1.5 disabled:opacity-40 ${
            added ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added
            </>
          ) : soldOut ? (
            'Sold out'
          ) : (
            'Add to cart'
          )}
        </button>
      </div>
    </article>
  );
}
