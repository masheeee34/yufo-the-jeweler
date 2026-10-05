'use client';

import React from 'react';
import Link from 'next/link';
import { AuthProvider } from '../../lib/authContext';
import { CartProvider } from '../../lib/cartContext';
import { AlexMossHeader } from '../../components/AlexMossHeader';
import { Footer as SiteFooter } from '../../components/Footer';
import { DISCORD_INVITE } from '../../components/CustomProjectWizard';

// Mentions légales, conditions de vente, remboursements et confidentialité.
// Texte de base : à relire et compléter (statut juridique, identifiants) par le propriétaire.
const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'notice',
    title: 'Legal notice',
    body: (
      <>
        <p>This website is published by YUFO The Jeweler, an independent digital studio creating 3D jewelry and accessories for FiveM roleplay servers.</p>
        <p>Contact: through our <a href={DISCORD_INVITE} target="_blank" rel="noreferrer">Discord server</a> or the concierge chat on this website.</p>
        <p>Hosting: OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>
        <p>YUFO is not affiliated with, endorsed or sponsored by Rockstar Games, Take-Two Interactive or Cfx.re. Third-party brand names mentioned on this site are used for descriptive purposes only and belong to their respective owners.</p>
      </>
    ),
  },
  {
    id: 'terms',
    title: 'Terms of sale',
    body: (
      <>
        <p>YUFO sells digital goods: 3D models and textures (.ydd / .ytd and related files) ready to stream on a FiveM server. No physical product is shipped.</p>
        <p>Prices are shown in US dollars. An order is confirmed once payment is received; files are then delivered digitally, through Discord or a download link.</p>
        <p>Custom commissions start with a request on this website. The price, delivery time and details are agreed with you before any work begins.</p>
        <p>Each purchase grants a license to use the files on your own server or character. Reselling, sharing, leaking or redistributing the files, modified or not, is forbidden and ends the license.</p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Refunds',
    body: (
      <>
        <p>Because our products are digital files delivered immediately, they cannot be returned once delivered. By ordering, you agree to the immediate delivery of the digital content and acknowledge that you lose your right of withdrawal once delivery has started.</p>
        <p>If a file does not work as described, contact us on Discord: we will fix it, replace it, or refund you if neither is possible.</p>
      </>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy policy',
    body: (
      <>
        <p>When you sign in with Discord we receive your Discord ID, username and avatar. If you contact us, we also keep your messages, your custom requests and the reference images you send.</p>
        <p>We use this data only to manage your account, answer your requests and deliver your orders. It is stored on servers located in the European Union and is never sold or shared with advertisers.</p>
        <p>The site uses a single essential cookie to keep you signed in. No advertising or tracking cookies are used.</p>
        <p>You can ask for a copy of your data, or for its deletion, at any time on our Discord server.</p>
      </>
    ),
  },
];

function LegalContent() {
  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <AlexMossHeader activeRoute="home" />
      <main className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <nav className="mb-6 text-[11px] uppercase tracking-[0.08em] text-[#888888]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-white">Legal</span>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Legal</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="h-9 px-4 rounded-full border border-white/10 text-xs text-zinc-300 hover:text-white hover:border-white/30 flex items-center transition-colors">
              {s.title}
            </a>
          ))}
        </div>
        <div className="mt-12 space-y-14">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="text-xl font-semibold mb-4">{s.title}</h2>
              <div className="legal-body space-y-3 text-sm leading-relaxed text-zinc-400">{s.body}</div>
            </section>
          ))}
        </div>
        <p className="mt-16 text-xs text-zinc-600">Last updated: October 2026</p>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function LegalPage() {
  return (
    <AuthProvider>
      <CartProvider>
        <LegalContent />
      </CartProvider>
    </AuthProvider>
  );
}
