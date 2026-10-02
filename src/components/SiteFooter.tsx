import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DISCORD_INVITE } from './CustomProjectWizard';

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Pages',
    links: [
      { label: 'Home', href: '/' },
      { label: 'All creations', href: '/collections/shop-all' },
      { label: 'Custom orders', href: '/custom-orders' },
      { label: 'Bespoke', href: '/bespoke' },
      { label: 'My account', href: '/account' },
    ],
  },
  {
    title: 'Collections',
    links: [
      { label: 'Pendants & medallions', href: '/collections/shop-all?category=pendants' },
      { label: 'Chains', href: '/collections/shop-all?category=chains' },
      { label: 'Watches', href: '/collections/shop-all?category=watches' },
      { label: 'Rings', href: '/collections/shop-all?category=rings' },
      { label: 'Grillz & studs', href: '/collections/shop-all?category=studs' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Discord', href: DISCORD_INVITE, external: true },
      { label: 'Support', href: DISCORD_INVITE, external: true },
      { label: 'My requests', href: '/account?tab=commissions' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Legal notice', href: '/legal#notice' },
      { label: 'Terms of sale', href: '/legal#terms' },
      { label: 'Refunds', href: '/legal#refunds' },
      { label: 'Privacy policy', href: '/legal#privacy' },
    ],
  },
];

// Pied de page commun : marque à gauche, quatre colonnes de liens, nom géant en filigrane.
export const SiteFooter: React.FC = () => (
  <footer className="relative w-full overflow-hidden border-t border-white/[0.06] bg-[#0a0a0b] px-5 sm:px-10 lg:px-14 pt-16 sm:pt-20">
    <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row justify-between gap-12 text-sm">
      <div className="space-y-4 max-w-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative w-8 h-8 rounded-[7px] bg-black border border-white/15 flex items-center justify-center overflow-hidden">
            <Image src="/assets/brand/yufo_clean_white.png" alt="" width={22} height={23} className="object-contain" />
          </span>
          <span className="font-semibold text-white">YUFO The Jeweler</span>
        </Link>
        <p className="text-neutral-500">© {new Date().getFullYear()} YUFO The Jeweler. All rights reserved.</p>
        <p className="text-[12px] leading-relaxed text-neutral-600">
          Digital haute joaillerie for FiveM. Not affiliated with Rockstar Games, Take-Two Interactive or Cfx.re.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-10">
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <p className="font-semibold text-neutral-200">{col.title}</p>
            <ul className="flex flex-col gap-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition-colors">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-neutral-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <p
      aria-hidden="true"
      className="select-none text-center font-bold leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 to-neutral-950 text-[28vw] lg:text-[19rem] mt-14 -mb-[0.12em]"
    >
      YUFO
    </p>
  </footer>
);
