'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AlexMossHeader } from '../../components/AlexMossHeader';
import { AlexMossChat } from '../../components/AlexMossChat';
import { AccountModal } from '../../components/AccountModal';
import { CartDrawer } from '../../components/CartDrawer';
import { CustomProjectWizard } from '../../components/CustomProjectWizard';
import { CartProvider, useCart } from '../../lib/cartContext';
import { AuthProvider } from '../../lib/authContext';

function CustomOrdersForm() {
  const searchParams = useSearchParams();
  const [referencedPiece, setReferencedPiece] = useState(searchParams.get('ref') || '');

  return (
    <div className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-8 py-12 sm:py-16 overflow-hidden">
      {/* Fond : image de campagne (à remplacer librement) */}
      <Image
        src="/assets/media/campaign_crew_simulation.jpg"
        alt=""
        fill
        priority
        quality={90}
        className="object-cover object-[center_40%] scale-105"
      />
      <div className="absolute inset-0 bg-[#070709]/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/40 via-transparent to-[#070709]" />

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        <nav className="text-xs text-zinc-400 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-200">Custom project</span>
        </nav>
        <CustomProjectWizard
          referencedPiece={referencedPiece}
          onClearReference={() => setReferencedPiece('')}
        />
      </div>
    </div>
  );
}

function CustomOrdersContent() {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { setIsCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans">
      {/* Top Header */}
      <AlexMossHeader
        activeRoute="custom"
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Commission Form wrapped in Suspense for useSearchParams */}
      <main className="flex-1 w-full border-b border-white/10" aria-label="Custom order commission">
        <Suspense
          fallback={
            <div className="py-24 text-center text-xs uppercase tracking-widest text-zinc-500">
              Loading custom commission studio...
            </div>
          }
        >
          <CustomOrdersForm />
        </Suspense>
      </main>

      {/* Technical Standards Bar */}
      <section className="border-t border-white/5 bg-zinc-950/60 py-10 select-none" aria-label="Atelier guarantees">
        <div className="max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              Complimentary FiveM rigging
            </p>
            <p className="text-xs text-zinc-400">
              Universal male & female freemode skeletons
            </p>
          </div>
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              Zero-tear weight painting
            </p>
            <p className="text-xs text-zinc-400">
              Tested across jackets, vests, and driving rigs
            </p>
          </div>
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              72-Hour concierge channel
            </p>
            <p className="text-xs text-zinc-400">
              Direct line with our master jeweler
            </p>
          </div>
          <div>
            <p className="text-xs text-white font-semibold mb-1">
              Confidential 1-of-1 rights
            </p>
            <p className="text-xs text-zinc-400">
              Exclusivity locked to your community
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050507] py-8 px-5 sm:px-10 lg:px-14 text-xs text-zinc-500">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span>© 2026 YUFO The Jeweler</span>
            <span>·</span>
            <span>SoHo & Los Santos Private Atelier</span>
          </div>
          <div className="flex items-center gap-6 text-zinc-400">
            <Link href="/collections/shop-all" className="hover:text-white transition-colors">Creations</Link>
            <Link href="/custom-orders" className="hover:text-white transition-colors">Custom orders</Link>
            <a href="https://discord.gg/yufothejeweler" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Discord lounge</a>
          </div>
        </div>
      </footer>

      {/* Concierge Live Chat */}
      <AlexMossChat />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenContact={() => {}}
      />
    </div>
  );
}

export default function CustomOrdersPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <CustomOrdersContent />
      </CartProvider>
    </AuthProvider>
  );
}
