// Pied de page modifiable depuis Management › Footer (sans toucher au code).
export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSettings {
  brandName: string;
  logo: string; // image du logo (carré), vide = pas de logo
  copyright: string; // {year} est remplacé par l'année en cours
  disclaimer: string;
  columns: FooterColumn[];
  bigText: string; // grand texte tout en bas
  showBigText: boolean;
}

export const DEFAULT_FOOTER: FooterSettings = {
  brandName: 'YUFO The Jeweler',
  logo: '/assets/brand/yufo_icon_black.png',
  copyright: '© {year} YUFO The Jeweler. All rights reserved.',
  disclaimer: 'Digital haute joaillerie for FiveM. Not affiliated with Rockstar Games, Take-Two Interactive or Cfx.re.',
  columns: [
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
        { label: 'Discord', href: 'https://discord.gg/yufothejeweler' },
        { label: 'Support', href: 'https://discord.gg/yufothejeweler' },
        { label: 'My requests', href: '/tickets' },
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
  ],
  bigText: 'YUFO',
  showBigText: true,
};

export const FOOTER_LIMITS = { columns: 6, links: 12 };
