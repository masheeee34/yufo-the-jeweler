'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SiteFooter } from '../components/SiteFooter';
import Link from 'next/link';
import Image from 'next/image';
import { AlexMossHeader } from '../components/AlexMossHeader';
import { AlexMossChat } from '../components/AlexMossChat';
import { AccountModal } from '../components/AccountModal';
import { CartDrawer } from '../components/CartDrawer';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartProvider, useCart } from '../lib/cartContext';
import { AuthProvider } from '../lib/authContext';
import { YUFO_PRODUCTS, Product } from '../lib/products';
import { ArrowRight, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import ReviewsMarquee from '../components/ReviewsMarquee';

function HomeContent() {
  const { addToCart, setIsCartOpen } = useCart();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(YUFO_PRODUCTS);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
        }
      })
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  // 4 Flagship showcase pieces (prioritizes featured items, then first 4)
  const featuredCreations = useMemo(() => {
    const featured = allProducts.filter((p) => p.featured);
    if (featured.length >= 4) return featured.slice(0, 4);
    const nonFeatured = allProducts.filter((p) => !p.featured);
    return [...featured, ...nonFeatured].slice(0, 4);
  }, [allProducts]);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans">
      {/* 1. Unified Navigation */}
      <AlexMossHeader
        activeRoute="home"
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Hero Section — Clear Promise & Jewelry Focus */}
        <section className="relative min-h-[82vh] sm:min-h-[88vh] flex items-center justify-center px-6 sm:px-12 py-20 overflow-hidden" aria-label="Atelier Introduction">
          {/* Subtle Ambient Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/media/campaign_crew_simulation.jpg"
              alt="YUFO The Jeweler Atelier"
              fill
              priority
              quality={90}
              className="object-cover object-center opacity-30 scale-[1.01]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/80 via-[#070709]/60 to-[#070709]" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-block text-xs uppercase tracking-[0.2em] text-zinc-400 font-medium">
              Los Santos & SoHo 3D Atelier
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.08]">
              High-quality jewelry sculpted for FiveM
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed font-normal">
              Custom medallions, iced timepieces, and heavy chains rigged to GTA V ped skeletons with clean weight painting and stream-ready files.
            </p>

            {/* Obvious Next Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
              <Link
                href="/collections/shop-all"
                className="w-full sm:w-auto px-7 h-12 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Explore creations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/custom-orders"
                className="w-full sm:w-auto px-7 h-12 bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start your custom project</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Featured Creations Showcase — Show The Real Work */}
        <section className="max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 py-16 sm:py-24 border-t border-white/5" aria-label="Featured Creations">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium block mb-1">
                Atelier catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Featured creations
              </h2>
            </div>

            <Link
              href="/collections/shop-all"
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto group"
            >
              <span>View all creations</span>
              <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>

          {/* Grid of 4 Pieces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredCreations.map((product) => (
              <article
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group p-4 bg-zinc-950 border border-white/10 hover:border-white/20 rounded-2xl transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Visual */}
                <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden mb-4 flex items-center justify-center p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/10">
                      .ydd / .ytd
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {product.brand}
                  </span>
                  <h3 className="text-sm font-semibold text-white tracking-tight truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 truncate">
                    {product.specs.material}
                  </p>
                </div>

                {/* Action & Price */}
                <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    {product.priceDisplay}
                  </span>
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 4. Concrete Technical Guarantees — Explain Just Enough */}
        <section className="border-y border-white/5 bg-zinc-950/60 py-16 sm:py-20" aria-label="Technical Standards">
          <div className="max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14">
            <div className="max-w-xl mb-12">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium block mb-1">
                Engineering & Quality
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Sculpted for game physics and character animation
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Zero-tear ped skeleton rigging
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  Weight-painted directly against universal MP male and female ped skeletons. Tested across leather jackets, tactical vests, and sports driving poses.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Optimized .ydd and .ytd streams
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  Clean geometry with balanced polygon counts and custom normal/specular maps for maximum diamond luster without server FPS drops.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Instant stream allocation or 72h custom turn
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  Premade catalog items can be acquired directly for your server. Bespoke 1-of-1 projects receive an active 72-hour direct line with our jeweler.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Clear Conversion Section */}
        <section className="max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 py-20 text-center" aria-label="Custom Project Invitation">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight">
              Have a custom jewelry concept in mind?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
              From gang crest medallions to custom-sculpted engagement bands, describe your vision or attach reference media to get an exact quote and 3D preview.
            </p>
            <div className="pt-2">
              <Link
                href="/custom-orders"
                className="inline-flex items-center justify-center gap-2 px-8 h-12 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs rounded-full transition-all cursor-pointer shadow-lg"
              >
                <span>Start your custom project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Client Reviews Carousel / Infinite Marquee */}
        <ReviewsMarquee />
      </main>

      <SiteFooter />

      {/* Floating 72h Concierge Chat */}
      <AlexMossChat />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenContact={() => {}}
      />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenBespoke={() => {
            setSelectedProduct(null);
            window.location.href = `/custom-orders?ref=${encodeURIComponent(selectedProduct.name)}`;
          }}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <CartProvider>
        <HomeContent />
      </CartProvider>
    </AuthProvider>
  );
}
