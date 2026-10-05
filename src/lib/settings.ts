import { readJson, writeJson } from './jsonStore';
import { DEFAULT_WIZARD, WizardSettings } from './wizardDefaults';
import { DEFAULT_FOOTER, FooterSettings } from './footerDefaults';
import { DEFAULT_TICKETS, TicketSettings } from './ticketDefaults';

// Réglages du site modifiables depuis Settings. Les secrets (clé Stripe secrète…) n'y sont jamais stockés :
// ils restent dans les variables d'environnement du serveur.
export interface SiteSettings {
  site: {
    title: string;
    description: string;
    favicon: string;
  };
  home: {
    eyebrow: string;
    title: string;
    subtitle: string;
    customTitle: string;
    customText: string;
    premadeTitle: string;
    premadeText: string;
  };
  socialProof: {
    enabled: boolean;
    count: string;
    label: string;
    avatars: string[];
    show: number;
  };
  general: {
    brandName: string;
    tagline: string;
    contactEmail: string;
    discordInvite: string;
    announcement: string;
    announcementLink: string;
    socials: { instagram: string; tiktok: string; youtube: string; x: string };
    customPageIntro: string;
  };
  customOrders: {
    mode: 'open' | 'limited' | 'closed';
    startingPrice: number;
    budgets: string[];
    durations: string[];
    defaultLeadTime: string;
    note: string;
    budgetMin: number;
    budgetStep: number;
    pedOptions: string[];
  };
  wizard: WizardSettings;
  payments: {
    currency: 'USD' | 'EUR' | 'GBP';
    methods: string[];
    stripePublishableKey: string;
    stripeEnabled: boolean;
  };
  security: {
    sessionDays: number;
    discordGuildRequired: boolean; // connexion Discord réservée aux membres du serveur
  };
  footer: FooterSettings;
  tickets: TicketSettings;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  site: {
    title: 'YUFO | Haute Joaillerie & Bespoke 3D FiveM Atelier',
    description: 'Bespoke diamond chains, custom pendants, and iced-out timepieces rigged for FiveM ped skeletons. Handcrafted 3D luxury atelier.',
    favicon: '/assets/brand/yufo_clean_white.png',
  },
  home: {
    eyebrow: 'Los Santos & SoHo 3D Atelier',
    title: 'High-quality jewelry sculpted for FiveM',
    subtitle: 'Custom medallions, iced timepieces and heavy chains rigged to GTA V ped skeletons, with clean weight painting and stream-ready files.',
    customTitle: 'Create your custom piece',
    customText: 'Tell us your idea: we sculpt a 1-of-1 piece, made for you.',
    premadeTitle: 'Shop ready-made pieces',
    premadeText: 'Browse finished creations, ready to stream on your server today.',
  },
  socialProof: {
    enabled: true,
    count: '99',
    label: 'collectors trust YUFO',
    avatars: [],
    show: 5,
  },
  general: {
    brandName: 'YUFO The Jeweler',
    tagline: 'Digital haute joaillerie for FiveM',
    contactEmail: '',
    discordInvite: 'https://discord.gg/yufothejeweler',
    announcement: '',
    announcementLink: '',
    socials: { instagram: '', tiktok: '', youtube: '', x: '' },
    customPageIntro: '',
  },
  customOrders: {
    mode: 'open',
    startingPrice: 24.99,
    budgets: ['$50', '$100', '$250', '$500', '$1K+'],
    durations: ['1 week', '2 weeks', '4 weeks', '6 weeks', '8+ weeks'],
    defaultLeadTime: '2 to 4 weeks',
    note: '',
    budgetMin: 24.99,
    budgetStep: 5,
    pedOptions: ['Universal (male & female)', 'Male freemode', 'Female freemode', 'Custom ped'],
  },
  wizard: DEFAULT_WIZARD,
  payments: {
    currency: 'USD',
    methods: ['Stripe (card)', 'PayPal', 'Crypto'],
    stripePublishableKey: '',
    stripeEnabled: false,
  },
  security: {
    sessionDays: 30,
    discordGuildRequired: false,
  },
  footer: DEFAULT_FOOTER,
  tickets: DEFAULT_TICKETS,
};

export function getSettings(): SiteSettings {
  const saved = readJson<Partial<SiteSettings>>('settings.json', {});
  return {
    site: { ...DEFAULT_SETTINGS.site, ...saved.site },
    home: { ...DEFAULT_SETTINGS.home, ...saved.home },
    socialProof: { ...DEFAULT_SETTINGS.socialProof, ...saved.socialProof },
    general: {
      ...DEFAULT_SETTINGS.general,
      ...saved.general,
      socials: { ...DEFAULT_SETTINGS.general.socials, ...saved.general?.socials },
    },
    customOrders: { ...DEFAULT_SETTINGS.customOrders, ...saved.customOrders },
    wizard: {
      ...DEFAULT_SETTINGS.wizard,
      // Les réponses du ped étaient d'abord réglées dans Custom orders : on les reprend.
      ...(saved.customOrders?.pedOptions?.length ? { pedOptions: saved.customOrders.pedOptions } : {}),
      ...saved.wizard,
      texts: { ...DEFAULT_SETTINGS.wizard.texts, ...saved.wizard?.texts },
    },
    payments: { ...DEFAULT_SETTINGS.payments, ...saved.payments },
    security: { ...DEFAULT_SETTINGS.security, ...saved.security },
    footer: { ...DEFAULT_SETTINGS.footer, ...saved.footer },
    tickets: {
      ...DEFAULT_SETTINGS.tickets,
      ...saved.tickets,
      defaultPerms: { ...DEFAULT_SETTINGS.tickets.defaultPerms, ...saved.tickets?.defaultPerms },
    },
  };
}

export function saveSettings(s: SiteSettings) {
  writeJson('settings.json', s);
}

// Partie publique, lue par le site (formulaire sur mesure, bandeau d'annonce).
export function publicSettings() {
  const s = getSettings();
  return {
    site: s.site,
    home: s.home,
    socialProof: s.socialProof,
    general: s.general,
    customOrders: s.customOrders,
    wizard: s.wizard,
    payments: { currency: s.payments.currency, methods: s.payments.methods, stripeEnabled: s.payments.stripeEnabled },
    footer: s.footer,
    tickets: { statuses: s.tickets.statuses, sound: s.tickets.sound, soundVolume: s.tickets.soundVolume, maxFileMb: s.tickets.maxFileMb },
  };
}
