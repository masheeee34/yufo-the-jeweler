'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { SiteFooter } from '../components/SiteFooter';
import { AlexMossHeader } from '../components/AlexMossHeader';
import { AlexMossChat } from '../components/AlexMossChat';
import { AccountModal } from '../components/AccountModal';
import { CartDrawer } from '../components/CartDrawer';
import { AvatarCircles } from '../components/AvatarCircles';
import ReviewsMarquee from '../components/ReviewsMarquee';
import { CartProvider, useCart } from '../lib/cartContext';
import { AuthProvider } from '../lib/authContext';

interface HomeTexts {
  eyebrow: string;
  title: string;
  subtitle: string;
  customTitle: string;
  customText: string;
  premadeTitle: string;
  premadeText: string;
}

// Valeurs affichées avant le chargement des réglages (Management › General).
const DEFAULT_HOME: HomeTexts = {
  eyebrow: 'Los Santos & SoHo 3D Atelier',
  title: 'High-quality jewelry sculpted for FiveM',
  subtitle: 'Custom medallions, iced timepieces and heavy chains rigged to GTA V ped skeletons, with clean weight painting and stream-ready files.',
  customTitle: 'Create your custom piece',
  customText: 'Tell us your idea: we sculpt a 1-of-1 piece, made for you.',
  premadeTitle: 'Shop ready-made pieces',
  premadeText: 'Browse finished creations, ready to stream on your server today.',
};

function ChoiceCard({ href, image, icon, title, text, cta, delay }: { href: string; image: string; icon: React.ReactNode; title: string; text: string; cta: string; delay: number }) {
  return (
    <Link
      href={href}
      className="home-choice group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md min-h-[220px] sm:min-h-[260px] flex flex-col justify-end p-6 sm:p-7 text-left transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-white/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-45 transition-[transform,opacity] duration-700 group-hover:scale-105 group-hover:opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="relative">
        <span className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center mb-4 text-white">{icon}</span>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">{title}</h2>
        {text && <p className="mt-1.5 text-sm text-zinc-300 max-w-sm">{text}</p>}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
          {cta}
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

// Page d'accueil : une seule entrée, le client choisit entre sur mesure et pièces prêtes.
function HomeContent() {
  const { setIsCartOpen } = useCart();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [home, setHome] = useState<HomeTexts>(DEFAULT_HOME);
  const [proof, setProof] = useState<{ enabled: boolean; count: string; label: string; avatars: string[]; show: number } | null>(null);
  const [premadeImage, setPremadeImage] = useState('/assets/products/category_chains.png');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.home) setHome({ ...DEFAULT_HOME, ...d.home });
        if (d.socialProof) setProof(d.socialProof);
      })
      .catch(() => {});
    fetch('/api/products')
      .then((r) => r.json())
      .then((d) => {
        const p = (d.products || []).find((x: { featured?: boolean }) => x.featured) || d.products?.[0];
        if (p?.image) setPremadeImage(p.image);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-white selection:text-black font-sans">
      <AlexMossHeader activeRoute="home" onOpenAccount={() => setIsAccountOpen(true)} onOpenCart={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <section className="relative min-h-[calc(100dvh-64px)] sm:min-h-[calc(100dvh-80px)] flex items-center justify-center px-5 sm:px-10 py-16 overflow-hidden" aria-label="YUFO">
          <div className="absolute inset-0">
            <Image src="/assets/media/campaign_crew_simulation.jpg" alt="" fill priority sizes="100vw" className="home-bg object-cover object-center opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/70 via-[#070709]/55 to-[#070709]" />
          </div>

          <div className="relative w-full max-w-5xl text-center">
            {home.eyebrow && <p className="home-rise text-[11px] uppercase tracking-[0.3em] text-zinc-400">{home.eyebrow}</p>}
            <h1 className="home-rise mt-4 text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] text-white max-w-3xl mx-auto" style={{ animationDelay: '80ms' }}>
              {home.title}
            </h1>
            {home.subtitle && (
              <p className="home-rise mt-5 text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed" style={{ animationDelay: '160ms' }}>
                {home.subtitle}
              </p>
            )}

            <div className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <ChoiceCard href="/custom-orders" image="/assets/media/campaign_crew_simulation.jpg" icon={<Sparkles className="w-4 h-4" />} title={home.customTitle} text={home.customText} cta="Start your custom project" delay={260} />
              <ChoiceCard href="/collections/shop-all" image={premadeImage} icon={<ShoppingBag className="w-4 h-4" />} title={home.premadeTitle} text={home.premadeText} cta="Explore creations" delay={360} />
            </div>
          </div>
        </section>

        {proof?.enabled && (
          <section className="pt-14 pb-2 px-5" aria-label="Collectors">
            <AvatarCircles avatars={proof.avatars} count={proof.count} label={proof.label} show={proof.show} />
          </section>
        )}

        <ReviewsMarquee />
      </main>

      <SiteFooter />
      <AlexMossChat />
      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} onOpenCart={() => setIsCartOpen(true)} onOpenContact={() => {}} />
      <CartDrawer />
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
