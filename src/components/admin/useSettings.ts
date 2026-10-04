'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from './AdminContext';
import type { WizardSettings } from '@/lib/wizardDefaults';

export interface Settings {
  site: { title: string; description: string; favicon: string };
  home: { eyebrow: string; title: string; subtitle: string; customTitle: string; customText: string; premadeTitle: string; premadeText: string };
  socialProof: { enabled: boolean; count: string; label: string; avatars: string[]; show: number };
  general: {
    brandName: string; tagline: string; contactEmail: string; discordInvite: string; announcement: string; announcementLink: string;
    socials: { instagram: string; tiktok: string; youtube: string; x: string }; customPageIntro: string;
  };
  customOrders: {
    mode: 'open' | 'limited' | 'closed'; startingPrice: number; budgets: string[]; durations: string[]; defaultLeadTime: string; note: string;
    budgetMin: number; budgetStep: number; pedOptions: string[];
  };
  wizard: WizardSettings;
  payments: { currency: 'USD' | 'EUR' | 'GBP'; methods: string[]; stripePublishableKey: string; stripeEnabled: boolean };
  security: { sessionDays: number };
}

// Chargement et enregistrement d'une section des réglages.
export function useSettings<K extends keyof Settings>(section: K) {
  const { api, toast } = useAdmin();
  const [values, setValues] = useState<Settings[K] | null>(null);
  const [meta, setMeta] = useState<{ stripeSecretConfigured: boolean }>({ stripeSecretConfigured: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const d = await api<{ settings: Settings; stripeSecretConfigured: boolean }>('/api/admin/settings');
    if (d) { setValues(d.settings[section]); setMeta({ stripeSecretConfigured: d.stripeSecretConfigured }); }
  }, [api, section]);
  useEffect(() => { load(); }, [load]);

  const save = async (v: Settings[K] = values!) => {
    setSaving(true);
    const d = await api<{ settings: Settings }>('/api/admin/settings', { method: 'PUT', body: { section, values: v } });
    setSaving(false);
    if (d) { setValues(d.settings[section]); toast('Saved successfully'); }
  };

  return { values, setValues, save, saving, meta };
}
