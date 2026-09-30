'use strict';
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { YUFO_PRODUCTS, CATEGORIES_NAV, ProductCategory, Product } from '../lib/products';
import { useCart } from '../lib/cartContext';

interface StoreSectionProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onSelectProduct: (product: Product) => void;
}

export const StoreSection: React.FC<StoreSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const filteredProducts =
    selectedCategory === 'all'
      ? YUFO_PRODUCTS
      : YUFO_PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section id="collection" className="py-24 px-6 sm:px-12 md:px-16 bg-[#070708] border-t border-white/10 select-none">
      <div className="max-w-[1920px] mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#c9aa6c]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c9aa6c] font-medium">
                The Permanent Vault · GTA V & FiveM Skeletons
              </span>
            </div>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-serif font-light tracking-tight">
              Curated Allocations & Catalog
            </h2>
            <p className="text-white/60 text-xs sm:text-sm font-light mt-2 max-w-xl">
              Authentic high jewelry and horology references ready for server stream injection (.ydr / .ytd).
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 overflow-x-auto scrollbar-none self-start md:self-auto">
            {CATEGORIES_NAV.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-none px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black font-semibold shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group cursor-pointer rounded-3xl bg-[#0c0c0e] border border-white/10 hover:border-white/30 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl relative"
            >
              {/* Product Visual */}
              <div className="w-full aspect-square rounded-2xl bg-black border border-white/[0.06] relative overflow-hidden flex items-center justify-center p-6 mb-5 group-hover:border-white/20 transition-all">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                />
                {product.featured && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] uppercase tracking-wider font-semibold text-white">
                    Featured
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-white/40 uppercase tracking-[0.15em] font-sans">
                    <span>{product.brand}</span>
                    <span>Ref. {product.reference}</span>
                  </div>

                  <h3 className="text-white text-base font-normal tracking-tight mt-1 group-hover:text-white transition-colors">
                    {product.name}
                  </h3>

                  <p className="text-white/50 text-xs font-light line-clamp-2 mt-1 leading-relaxed">
                    {product.shortDescription}
                  </p>
                </div>

                {/* Footer with Price and Add to Cart */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between mt-4">
                  <div>
                    <span className="block text-[9px] text-white/40 uppercase tracking-widest">Allocation</span>
                    <span className="text-base font-sans font-medium tracking-wide text-white">
                      {product.priceDisplay}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleAdd(product, e)}
                    className={`h-10 px-5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                      addedId === product.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-black hover:bg-neutral-200 shadow-md hover:scale-105'
                    }`}
                  >
                    {addedId === product.id ? 'Added ✓' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
