'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Product } from '../lib/products';
import { useCart } from '../lib/cartContext';
import { X, ShoppingBag, Sparkles, ShieldCheck, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenBespoke: () => void;
}

// Sections affichées à droite : celles réglées dans Management, sinon description + caractéristiques.
function detailsOf(p: Product) {
  if (p.details && p.details.length) return p.details;
  return [
    { title: 'Description', content: p.fullDescription },
    {
      title: 'Specifications',
      content: `Precious metal: ${p.specs.material}\nStone setting: ${p.specs.stones}\nFiveM compatibility: ${p.specs.compatibility}`,
    },
    { title: 'Delivery', content: p.specs.delivery },
  ];
}

// Carrousel : grande image qui glisse, flèches, balayage tactile et vignettes en dessous.
function Gallery({ images, name, reference }: { images: string[]; name: string; reference: string }) {
  const [i, setI] = useState(0);
  const startX = useRef<number | null>(null);
  const go = (n: number) => setI((n + images.length) % images.length);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setI((n) => (n - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setI((n) => (n + 1) % images.length);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [images.length]);

  return (
    <div className="space-y-3">
      <div
        className="relative w-full aspect-[4/5] bg-black border border-white/10 rounded-2xl overflow-hidden touch-pan-y"
        onPointerDown={(e) => (startX.current = e.clientX)}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
          startX.current = null;
        }}
      >
        <div className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
          {images.map((src, n) => (
            <div key={src + n} className="relative w-full h-full shrink-0">
              <Image src={src} alt={`${name} ${n + 1}`} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" priority={n === 0} draggable={false} />
            </div>
          ))}
        </div>

        {/* Flou progressif en bas de l'image, sous les informations */}
        <div className="progressive-blur pointer-events-none absolute inset-x-0 bottom-0 h-28" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/10 backdrop-blur-md">.ydd / .ytd</span>
          <span className="text-[10px] text-zinc-400 font-mono">REF. {reference}</span>
        </div>
        <div className="absolute bottom-3.5 right-3.5 text-[10px] text-zinc-300 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>FiveM rigged ready</span>
        </div>

        {images.length > 1 && (
          <>
            <button onClick={() => go(i - 1)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => go(i + 1)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, n) => (
                <span key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n === i ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, n) => (
            <button
              key={src + n}
              onClick={() => setI(n)}
              aria-label={`Image ${n + 1}`}
              className={`relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border transition-all ${n === i ? 'border-white opacity-100' : 'border-white/10 opacity-50 hover:opacity-90'}`}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Sections dépliables (une ouverte à la fois).
function Accordion({ items }: { items: { title: string; content: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map((it, n) => {
        const isOpen = open === n;
        return (
          <div key={it.title + n}>
            <button onClick={() => setOpen(isOpen ? -1 : n)} className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-white" aria-expanded={isOpen}>
              {it.title}
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <p className="pb-4 text-xs text-zinc-400 leading-relaxed whitespace-pre-line">{it.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onOpenBespoke }) => {
  const { addToCart } = useCart();

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  if (!product) return null;

  const images = [product.image, ...(product.gallery || [])].filter((src, n, all) => src && all.indexOf(src) === n);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none font-sans" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="product-modal relative w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-3xl p-5 sm:p-8 text-white max-h-[94vh] overflow-y-auto overscroll-contain shadow-[0_25px_80px_rgba(0,0,0,0.95)]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors" aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pt-2">
          <Gallery images={images} name={product.name} reference={product.reference} />

          <div className="space-y-5 md:pt-4">
            <div>
              <span className="text-xs text-zinc-400 font-medium">{product.brand}</span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-1 tracking-tight">{product.name}</h2>
              <div className="text-xl font-semibold text-zinc-100 mt-2">{product.priceDisplay}</div>
              {product.shortDescription && <p className="text-sm text-zinc-400 mt-2">{product.shortDescription}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => { addToCart(product); onClose(); }}
                className="flex-1 h-12 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm rounded-full transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to cart</span>
              </button>
              {product.allowSimilarProject !== false && (
                <button
                  type="button"
                  onClick={() => { onClose(); onOpenBespoke(); }}
                  className="h-12 px-5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-sm rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  <span>Start a similar project</span>
                </button>
              )}
            </div>

            <Accordion items={detailsOf(product)} />
          </div>
        </div>
      </div>
    </div>
  );
};
