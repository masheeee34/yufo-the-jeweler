'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { SiteFooter } from '../../../components/SiteFooter';
import { ProductDetailModal } from '../../../components/ProductDetailModal';
import { LoaderOne } from '../../../components/LoaderOne';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Product,
  ProductCategory,
  ProductCollection,
  CATEGORIES_NAV,
  COLLECTIONS_NAV,
} from '../../../lib/products';
import { AlexMossHeader } from '../../../components/AlexMossHeader';
import { AlexMossChat } from '../../../components/AlexMossChat';
import { AccountModal } from '../../../components/AccountModal';
import { CartDrawer } from '../../../components/CartDrawer';
import { AuthProvider } from '../../../lib/authContext';
import { CartProvider, useCart } from '../../../lib/cartContext';


function CollectionsFilterGrid() {
  const searchParams = useSearchParams();
  const initialCategoryParam = (searchParams.get('category') as ProductCategory) || 'all';
  const initialCollectionParam = (searchParams.get('collection') as ProductCollection) || null;

  const [activeCategory, setActiveCategory] = useState<ProductCategory>(initialCategoryParam);
  const [activeCollection, setActiveCollection] = useState<ProductCollection | null>(initialCollectionParam);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Liste vide au départ : on n'affiche que le catalogue réel (pas les anciens articles intégrés au code).
  const [productsList, setProductsList] = useState<Product[]>([]);
  // Catégories et collections telles que réglées dans le back-office (ordre, noms, visibilité).
  const [cats, setCats] = useState<{ id: string; label: string }[]>(CATEGORIES_NAV.filter((c) => c.id !== 'all'));
  const [cols, setCols] = useState<{ id: string; label: string; desc?: string }[]>(COLLECTIONS_NAV.filter((c) => c.id !== 'all'));

  useEffect(() => {
    fetch('/api/taxonomy')
      .then((res) => res.json())
      .then((t) => {
        if (Array.isArray(t.categories)) setCats(t.categories);
        if (Array.isArray(t.collections)) setCols(t.collections.map((c: { id: string; label: string; description?: string }) => ({ ...c, desc: c.description })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setProductsList(data.products);
        }
      })
      .catch((err) => console.error('Failed to load products from API:', err));
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    if (activeCollection && activeCollection !== 'all') {
      list = list.filter((p) => p.collection === activeCollection);
    } else if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    return list;
  }, [productsList, activeCategory, activeCollection]);

  const currentTitle = useMemo(() => {
    if (activeCollection && activeCollection !== 'all') {
      const col = cols.find((c) => c.id === activeCollection);
      return col ? col.label : 'Collection';
    }
    const cat = cats.find((c) => c.id === activeCategory);
    return cat ? cat.label : 'All Creations';
  }, [activeCategory, activeCollection, cats, cols]);

  const currentSubtitle = useMemo(() => {
    if (activeCollection && activeCollection !== 'all') {
      const col = cols.find((c) => c.id === activeCollection);
      return col?.desc || 'Exclusive high-jewelry archive sculpted for FiveM character models.';
    }
    return 'Shop every Yufo piece — diamond pendants, heavy chains, signet rings, and iced timepieces, each handcrafted and rigged for FiveM ped skeletons in our atelier.';
  }, [activeCollection, cols]);

  const handleInquiryFromProduct = (name: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yufo_inquiry_intent', name);
    }
    setSelectedProduct(null);
    // Opens custom orders with context or routes directly
    window.location.href = `/custom-orders?ref=${encodeURIComponent(name)}`;
  };

  return (
    <>
      {/* Editorial Hero (Exact Alex Moss split — Zero Card Border) */}
      <section className="mb-12" aria-label="Collection Overview">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          
          <div className="lg:col-span-12 flex flex-col justify-end pb-2">
            <h1 className="text-3xl sm:text-4xl lg:text-[52px] tracking-[-1px] uppercase font-normal text-white mb-4 leading-[0.95]">
              {currentTitle}
            </h1>
            <p className="text-[15px] text-[#888888] leading-[1.5] max-w-xl">
              {currentSubtitle}
            </p>
          </div>

        </div>
      </section>

      {/* Navigation Category / Collection Tabs (Exact Alex Moss horizontal text strip) */}
      <div className="border-b border-[#16161d] pb-4 mb-8 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 sm:gap-8 text-[13px] uppercase tracking-[0.06em] min-w-max">
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveCollection(null);
            }}
            className={`pb-1 transition-all cursor-pointer ${
              activeCategory === 'all' && !activeCollection
                ? 'text-white border-b border-white font-medium'
                : 'text-[#777777] hover:text-white'
            }`}
          >
            All Pieces
          </button>

          {cats.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveCollection(null);
              }}
              className={`pb-1 transition-all cursor-pointer ${
                activeCategory === cat.id && !activeCollection
                  ? 'text-white border-b border-white font-medium'
                  : 'text-[#777777] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {cols.length > 0 && <span className="text-[#33333d] select-none">/</span>}

          {cols.map((col) => (
            <button
              key={col.id}
              onClick={() => {
                setActiveCollection(col.id);
                setActiveCategory('all');
              }}
              className={`pb-1 transition-all cursor-pointer ${
                activeCollection === col.id
                  ? 'text-white border-b border-white font-medium'
                  : 'text-[#777777] hover:text-white'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter Row (Clean Minimal Text — Zero E-commerce Sort Dropdown) */}
      <div className="flex items-center justify-between pb-4 mb-4 text-[12px] uppercase tracking-[0.06em] text-[#666666]">
        <span>{filteredProducts.length} Creations</span>
      </div>

      {/* Product Grid — EXACT Alex Moss NY (4.8px gap, ZERO CADRES, ZERO CARD BORDERS) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-[4.8px]" aria-label="Creations Archive">
        {filteredProducts.map((product) => {
          return (
            <article
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="group cursor-pointer select-none"
            >
              {/* Image Container 1:1 Aspect Ratio (Zero Border) */}
              <div className="relative aspect-square w-full bg-[#0d0d12] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info Row (Pure Alex Moss typography) */}
              <div className="pt-2.5 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-[14px] text-white uppercase tracking-[0.04em] font-normal leading-snug">
                    {product.name}
                  </h2>
                  <p className="text-[12px] text-[#777777] uppercase tracking-[0.04em] mt-0.5">
                    {product.specs.material}
                  </p>
                </div>
                <div className="text-right pl-2">
                  <span className="text-[13px] text-[#cccccc] uppercase tracking-[0.04em]">
                    {product.priceDisplay}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Product Inspection Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenBespoke={() => handleInquiryFromProduct(selectedProduct.name)}
        />
      )}
    </>
  );
}

function CollectionsPageLayout() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between selection:bg-white selection:text-black">
      <AlexMossHeader
        activeRoute="shop"
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 py-8 lg:py-12" aria-label="Creations Archive">
        {/* Breadcrumb */}
        <nav className="mb-6 text-[11px] uppercase tracking-[0.08em] text-[#888888]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#888888]">Collections</span>
          <span className="mx-2">/</span>
          <span className="text-white">Shop All</span>
        </nav>

        <Suspense
          fallback={
            <div className="py-20 flex justify-center">
              <LoaderOne />
            </div>
          }
        >
          <CollectionsFilterGrid />
        </Suspense>
      </main>

      {/* Atelier Manifesto Bar */}
      <section className="border-t border-[#1a1a22] bg-[#070709] py-10 select-none mt-16" aria-label="Atelier Guarantees">
        <div className="max-w-[1720px] mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div>
            <p className="text-[13px] uppercase tracking-[0.05em] text-white font-medium mb-1">
              Complimentary FiveM Rigging
            </p>
            <p className="text-[12px] text-[#777777]">
              Universal male & female freemode skeletons
            </p>
          </div>
          <div>
            <p className="text-[13px] uppercase tracking-[0.05em] text-white font-medium mb-1">
              Zero-Tear Weight Painting
            </p>
            <p className="text-[12px] text-[#777777]">
              Tested across jackets, vests, and driving rigs
            </p>
          </div>
          <div>
            <p className="text-[13px] uppercase tracking-[0.05em] text-white font-medium mb-1">
              72-Hour Concierge Channel
            </p>
            <p className="text-[12px] text-[#777777]">
              Direct line with our master orfèvre
            </p>
          </div>
          <div>
            <p className="text-[13px] uppercase tracking-[0.05em] text-white font-medium mb-1">
              Confidential 1-of-1 Rights
            </p>
            <p className="text-[12px] text-[#777777]">
              Exclusivity locked to your community
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* 72H Concierge Chat Widget */}
      <AlexMossChat />

      {/* Atelier Checkout & Allocations Drawer */}
      <CartDrawer />

      {/* Collector Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenCart={() => {}}
        onOpenContact={() => {}}
      />
    </div>
  );
}

export default function CollectionsShopAllPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <CollectionsPageLayout />
      </CartProvider>
    </AuthProvider>
  );
}
