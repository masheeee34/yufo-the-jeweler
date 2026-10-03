import { readJson, writeJson } from './jsonStore';

// Réglages du site modifiables depuis Settings. Les secrets (clé Stripe secrète…) n'y sont jamais stockés :
// ils restent dans les variables d'environnement du serveur.
export interface SiteSettings {
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
  };
  payments: {
    currency: 'USD' | 'EUR' | 'GBP';
    methods: string[];
    stripePublishableKey: string;
    stripeEnabled: boolean;
  };
  security: {
    sessionDays: number;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
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
  },
  payments: {
    currency: 'USD',
    methods: ['Stripe (card)', 'PayPal', 'Crypto'],
    stripePublishableKey: '',
    stripeEnabled: false,
  },
  security: {
    sessionDays: 30,
  },
};

export function getSettings(): SiteSettings {
  const saved = readJson<Partial<SiteSettings>>('settings.json', {});
  return {
    general: {
      ...DEFAULT_SETTINGS.general,
      ...saved.general,
      socials: { ...DEFAULT_SETTINGS.general.socials, ...saved.general?.socials },
    },
    customOrders: { ...DEFAULT_SETTINGS.customOrders, ...saved.customOrders },
    payments: { ...DEFAULT_SETTINGS.payments, ...saved.payments },
    security: { ...DEFAULT_SETTINGS.security, ...saved.security },
  };
}

export function saveSettings(s: SiteSettings) {
  writeJson('settings.json', s);
}

// Partie publique, lue par le site (formulaire sur mesure, bandeau d'annonce).
export function publicSettings() {
  const s = getSettings();
  return {
    general: s.general,
    customOrders: s.customOrders,
    payments: { currency: s.payments.currency, methods: s.payments.methods, stripeEnabled: s.payments.stripeEnabled },
  };
}
