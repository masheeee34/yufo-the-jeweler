import { NextRequest, NextResponse } from 'next/server';
import { audit, can, diff, requireAdmin } from '@/lib/team';
import { getSettings, saveSettings, SiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const url = (v: unknown) => {
  const s = str(v, 300);
  return !s || /^https?:\/\/\S+$/i.test(s) ? s : null;
};

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'settings');
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({
    settings: getSettings(),
    // Les secrets ne quittent jamais le serveur : on indique seulement s'ils sont configurés.
    stripeSecretConfigured: !!process.env.STRIPE_SECRET_KEY,
    canPayments: can(ctx.member.role, 'payments'),
    canSecurity: can(ctx.member.role, 'security'),
  });
}

// Enregistre une section : general, customOrders, payments ou security.
export async function PUT(req: NextRequest) {
  const { section, values } = await req.json();
  const perm = section === 'payments' ? 'payments' : section === 'security' ? 'security' : 'settings';
  const ctx = requireAdmin(req, perm);
  if (ctx instanceof NextResponse) return ctx;

  const s = getSettings();
  const v = values || {};
  const before = JSON.parse(JSON.stringify(s[section as keyof SiteSettings] || {}));

  if (section === 'general') {
    const links = [v.discordInvite, v.announcementLink, v.socials?.instagram, v.socials?.tiktok, v.socials?.youtube, v.socials?.x].map(url);
    if (links.includes(null)) return NextResponse.json({ error: 'Un des liens est invalide (http ou https).' }, { status: 400 });
    s.general = {
      brandName: str(v.brandName, 80) || s.general.brandName,
      tagline: str(v.tagline, 140),
      contactEmail: str(v.contactEmail, 120),
      discordInvite: links[0] || s.general.discordInvite,
      announcement: str(v.announcement, 200),
      announcementLink: links[1] || '',
      socials: { instagram: links[2] || '', tiktok: links[3] || '', youtube: links[4] || '', x: links[5] || '' },
      customPageIntro: str(v.customPageIntro, 400),
    };
  } else if (section === 'customOrders') {
    const list = (x: unknown) => (Array.isArray(x) ? x : String(x || '').split(',')).map((i) => str(i, 20)).filter(Boolean).slice(0, 8);
    const budgets = list(v.budgets);
    const durations = list(v.durations);
    if (budgets.length < 2 || durations.length < 2) return NextResponse.json({ error: 'Au moins 2 budgets et 2 délais.' }, { status: 400 });
    s.customOrders = {
      mode: ['open', 'limited', 'closed'].includes(v.mode) ? v.mode : s.customOrders.mode,
      startingPrice: Math.max(0, Number(v.startingPrice) || 0),
      budgets,
      durations,
      defaultLeadTime: str(v.defaultLeadTime, 60),
      note: str(v.note, 300),
    };
  } else if (section === 'payments') {
    s.payments = {
      currency: ['USD', 'EUR', 'GBP'].includes(v.currency) ? v.currency : s.payments.currency,
      methods: (Array.isArray(v.methods) ? v.methods : String(v.methods || '').split(',')).map((m: unknown) => str(m, 40)).filter(Boolean).slice(0, 8),
      stripePublishableKey: /^pk_(test|live)_[A-Za-z0-9]+$/.test(str(v.stripePublishableKey, 200)) ? str(v.stripePublishableKey, 200) : '',
      stripeEnabled: !!v.stripeEnabled && !!process.env.STRIPE_SECRET_KEY,
    };
  } else if (section === 'security') {
    s.security = { sessionDays: Math.min(90, Math.max(1, Math.round(Number(v.sessionDays) || 30))) };
  } else {
    return NextResponse.json({ error: 'Section inconnue' }, { status: 400 });
  }

  saveSettings(s);
  const changes = diff(before, s[section as keyof SiteSettings] as Record<string, any>);
  if (changes) audit(ctx, `settings.${section}`, changes);
  return NextResponse.json({ success: true, settings: s });
}
