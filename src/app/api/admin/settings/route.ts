import { NextRequest, NextResponse } from 'next/server';
import { audit, can, diff, requireAdmin } from '@/lib/team';
import { getSettings, saveSettings, SiteSettings } from '@/lib/settings';
import { WIZARD_TEXT_KEYS } from '@/lib/wizardDefaults';
import { FOOTER_LIMITS } from '@/lib/footerDefaults';
import { STATUS_TONES, TicketStatus } from '@/lib/ticketDefaults';
import { mailConfigured } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const url = (v: unknown) => {
  const s = str(v, 300);
  return !s || /^https?:\/\/\S+$/i.test(s) ? s : null;
};
// Image hébergée sur le site (envoyée par le formulaire) ou adresse https.
const image = (v: unknown) => {
  const s = str(v, 300);
  return !s || /^\/(api\/uploads|assets)\/[\w./-]+$/.test(s) || /^https:\/\/\S+$/i.test(s) ? s : null;
};

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'settings');
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({
    settings: getSettings(),
    // Les secrets ne quittent jamais le serveur : on indique seulement s'ils sont configurés.
    stripeSecretConfigured: !!process.env.STRIPE_SECRET_KEY,
    mailConfigured: mailConfigured(),
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

  if (section === 'site') {
    const favicon = image(v.favicon);
    if (favicon === null) return NextResponse.json({ error: 'Icône invalide.' }, { status: 400 });
    s.site = {
      title: str(v.title, 120) || s.site.title,
      description: str(v.description, 300),
      favicon: favicon || s.site.favicon,
    };
  } else if (section === 'home') {
    s.home = {
      eyebrow: str(v.eyebrow, 80),
      title: str(v.title, 120) || s.home.title,
      subtitle: str(v.subtitle, 300),
      customTitle: str(v.customTitle, 80) || s.home.customTitle,
      customText: str(v.customText, 200),
      premadeTitle: str(v.premadeTitle, 80) || s.home.premadeTitle,
      premadeText: str(v.premadeText, 200),
    };
  } else if (section === 'socialProof') {
    const avatars = (Array.isArray(v.avatars) ? v.avatars : []).map(image);
    if (avatars.includes(null)) return NextResponse.json({ error: 'Une des photos est invalide.' }, { status: 400 });
    s.socialProof = {
      enabled: !!v.enabled,
      count: str(v.count, 12) || '99',
      label: str(v.label, 80),
      avatars: (avatars as string[]).filter(Boolean).slice(0, 12),
      show: Math.min(12, Math.max(0, Math.round(Number(v.show) || 0))),
    };
  } else if (section === 'general') {
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
      budgetMin: Math.max(0, Math.round((Number(v.budgetMin) || 0) * 100) / 100),
      budgetStep: Math.max(1, Math.round((Number(v.budgetStep) || 5) * 100) / 100),
      pedOptions: (Array.isArray(v.pedOptions) ? v.pedOptions : String(v.pedOptions || '').split(','))
        .map((o: unknown) => str(o, 40))
        .filter(Boolean)
        .slice(0, 8),
    };
    if (s.customOrders.pedOptions.length < 1) return NextResponse.json({ error: 'Au moins une réponse pour le choix du ped.' }, { status: 400 });
  } else if (section === 'wizard') {
    const pieces = (Array.isArray(v.pieces) ? v.pieces : [])
      .map((x: any) => ({ label: str(x?.label, 40), hint: str(x?.hint, 60) }))
      .filter((x: { label: string }) => x.label)
      .slice(0, 12);
    const pedOptions = (Array.isArray(v.pedOptions) ? v.pedOptions : []).map((o: unknown) => str(o, 40)).filter(Boolean).slice(0, 8);
    if (!pieces.length) return NextResponse.json({ error: 'Au moins un type de pièce.' }, { status: 400 });
    if (new Set(pieces.map((x: { label: string }) => x.label.toLowerCase())).size !== pieces.length) return NextResponse.json({ error: 'Deux types de pièce portent le même nom.' }, { status: 400 });
    if (!!v.askPed && !pedOptions.length) return NextResponse.json({ error: 'Au moins une réponse pour le choix du ped.' }, { status: 400 });
    const texts = {} as SiteSettings['wizard']['texts'];
    for (const k of WIZARD_TEXT_KEYS) texts[k] = str(v.texts?.[k], 400);
    s.wizard = {
      showDiscordButton: !!v.showDiscordButton,
      askPed: !!v.askPed,
      pedMultiple: !!v.pedMultiple,
      pedOptions: pedOptions.length ? pedOptions : s.wizard.pedOptions,
      askImages: !!v.askImages,
      maxImages: Math.min(6, Math.max(1, Math.round(Number(v.maxImages) || 6))),
      askDuration: !!v.askDuration,
      askBudget: !!v.askBudget,
      minBriefLength: Math.min(200, Math.max(0, Math.round(Number(v.minBriefLength) || 0))),
      pieces,
      texts,
    };
  } else if (section === 'payments') {
    s.payments = {
      currency: ['USD', 'EUR', 'GBP'].includes(v.currency) ? v.currency : s.payments.currency,
      methods: (Array.isArray(v.methods) ? v.methods : String(v.methods || '').split(',')).map((m: unknown) => str(m, 40)).filter(Boolean).slice(0, 8),
      stripePublishableKey: /^pk_(test|live)_[A-Za-z0-9]+$/.test(str(v.stripePublishableKey, 200)) ? str(v.stripePublishableKey, 200) : '',
      stripeEnabled: !!v.stripeEnabled && !!process.env.STRIPE_SECRET_KEY,
    };
  } else if (section === 'security') {
    s.security = {
      sessionDays: Math.min(90, Math.max(1, Math.round(Number(v.sessionDays) || 30))),
      discordGuildRequired: !!v.discordGuildRequired,
    };
  } else if (section === 'footer') {
    // Liens internes (/…), ancres (#…), e-mails (mailto:) ou adresses https.
    const href = (x: unknown) => {
      const h = str(x, 300);
      return /^\/(?!\/)\S*$/.test(h) || /^#\S*$/.test(h) || /^mailto:\S+$/i.test(h) || /^https?:\/\/\S+$/i.test(h) ? h : null;
    };
    const logo = image(v.logo);
    if (logo === null) return NextResponse.json({ error: 'Logo invalide.' }, { status: 400 });
    const columns = (Array.isArray(v.columns) ? v.columns : []).slice(0, FOOTER_LIMITS.columns).map((c: any) => ({
      title: str(c?.title, 40),
      links: (Array.isArray(c?.links) ? c.links : []).slice(0, FOOTER_LIMITS.links).map((l: any) => ({ label: str(l?.label, 60), href: href(l?.href) })),
    }));
    for (const c of columns) {
      if (!c.title) return NextResponse.json({ error: 'Chaque catégorie doit avoir un titre.' }, { status: 400 });
      for (const l of c.links) {
        if (!l.label) return NextResponse.json({ error: `Un lien de « ${c.title} » n'a pas de texte.` }, { status: 400 });
        if (l.href === null || !l.href) return NextResponse.json({ error: `Le lien « ${l.label} » est invalide (/page, https://…, mailto:…).` }, { status: 400 });
      }
    }
    s.footer = {
      brandName: str(v.brandName, 60),
      logo: logo || '',
      copyright: str(v.copyright, 160),
      disclaimer: str(v.disclaimer, 400),
      columns,
      bigText: str(v.bigText, 16),
      showBigText: !!v.showBigText,
    };
  } else if (section === 'tickets') {
    const statuses: TicketStatus[] = [];
    for (const x of (Array.isArray(v.statuses) ? v.statuses : []).slice(0, 15)) {
      const label = str(x?.label, 40);
      if (!label) continue;
      let id = str(x?.id, 40).toLowerCase().replace(/[^a-z0-9_]/g, '_') || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      while (statuses.some((y) => y.id === id)) id += '_2';
      statuses.push({ id, label, tone: STATUS_TONES.includes(x?.tone) ? x.tone : 'zinc', important: !!x?.important });
    }
    if (!statuses.length) return NextResponse.json({ error: 'Au moins un statut.' }, { status: 400 });
    const sound = str(v.sound, 200);
    if (sound && !/^\/sounds\/[a-z0-9-]+\.wav$/.test(sound) && !/^\/api\/uploads\/[a-f0-9]{32}\.(mp3|wav|ogg)$/.test(sound)) {
      return NextResponse.json({ error: 'Son invalide.' }, { status: 400 });
    }
    const dp = v.defaultPerms || {};
    s.tickets = {
      statuses,
      defaultStatus: statuses.some((x) => x.id === v.defaultStatus) ? v.defaultStatus : statuses[0].id,
      defaultPerms: { replies: !!dp.replies, images: !!dp.images, files: !!dp.files, downloads: !!dp.downloads, membersCanReply: !!dp.membersCanReply },
      sound,
      soundVolume: Math.min(1, Math.max(0, Number(v.soundVolume) || 0)),
      maxFileMb: Math.min(90, Math.max(1, Math.round(Number(v.maxFileMb) || 25))),
    };
  } else {
    return NextResponse.json({ error: 'Section inconnue' }, { status: 400 });
  }

  saveSettings(s);
  const changes = diff(before, s[section as keyof SiteSettings] as Record<string, any>);
  if (changes) audit(ctx, `settings.${section}`, changes);
  return NextResponse.json({ success: true, settings: s });
}
