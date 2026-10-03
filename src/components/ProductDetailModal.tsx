'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '../lib/products';
import { useCart } from '../lib/cartContext';
import { X, ShoppingBag, Sparkles, ShieldCheck, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenBespoke: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenBespoke,
}) => {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none font-sans">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-2xl p-6 sm:p-8 text-white max-h-[92vh] overflow-y-auto shadow-[0_25px_80px_rgba(0,0,0,0.95)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close product inspection"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
          
          {/* Visual 3D Showcase */}
          <div className="w-full aspect-square bg-black border border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center p-6">
            <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/10">
                .ydd / .ytd
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                REF. {product.reference}
              </span>
            </div>

            <div className="relative w-full h-full">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="absolute bottom-3.5 right-3.5 text-[10px] text-zinc-400 flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1 rounded-full border border-white/5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>FiveM rigged ready</span>
            </div>
          </div>

          {/* Technical Specs & Actions */}
          <div className="space-y-5">
            <div>
              <span className="text-xs text-zinc-400 font-medium">
                {product.brand} · Master collection
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-white mt-1 tracking-tight">
                {product.name}
              </h2>
              <div className="text-lg font-semibold text-zinc-100 mt-2">
                {product.priceDisplay}
              </div>
            </div>

            <p className="text-xs text-zinc-400 font-normal leading-relaxed">
              {product.fullDescription}
            </p>

            {/* Atelier Technical Specifications */}
            <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-400">Precious metal</span>
                <span className="text-zinc-200 font-medium">{product.specs.material}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-400">Stone setting</span>
                <span className="text-zinc-200 font-medium">{product.specs.stones}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-400">FiveM compatibility</span>
                <span className="text-zinc-200 font-medium">{product.specs.compatibility}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-zinc-400">Asset delivery</span>
                <span className="text-emerald-400 font-medium">{product.specs.delivery}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-11 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Acquire creation</span>
              </button>
              {product.allowSimilarProject !== false && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBespoke();
                }}
                className="h-11 px-5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Start a similar project</span>
              </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
