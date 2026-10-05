'use client';

import React from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '../../lib/authContext';
import { CartProvider } from '../../lib/cartContext';
import { AlexMossHeader } from '../AlexMossHeader';
import { Footer } from '../Footer';
import { LoaderOne } from '../LoaderOne';

function Gate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-24 flex justify-center"><LoaderOne /></div>;
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-10 bg-zinc-950 border border-white/10 rounded-2xl text-center space-y-4">
        <p className="text-base font-semibold text-white">Sign in to see your tickets</p>
        <p className="text-sm text-zinc-400">Your tickets are private: sign in with the account you used for your request.</p>
        <Link href={`/account?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/tickets')}`} className="inline-flex h-11 px-6 items-center justify-center rounded-full bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-200">
          Sign in
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}

// Mise en page commune des pages de tickets (en-tête du site, connexion obligatoire, pied de page).
export function TicketShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans selection:bg-white selection:text-black">
          <AlexMossHeader activeRoute="home" />
          <main className="flex-1 w-full max-w-[1720px] mx-auto px-5 sm:px-10 lg:px-14 py-10 lg:py-14">
            <Gate>{children}</Gate>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
