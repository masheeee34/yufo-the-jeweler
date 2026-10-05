import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getSettings } from './settings';

// Envoi des e-mails du site (vérification d'adresse, nouveau mot de passe).
// Fournisseur réglé dans les variables d'environnement du serveur, jamais dans le code :
//   RESEND_API_KEY + MAIL_FROM            → Resend
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS + MAIL_FROM → n'importe quel serveur SMTP (Brevo, Gmail…)
//   MAIL_TRANSPORT=log                    → les e-mails sont écrits dans data/outbox (tests)
export function mailConfigured(): boolean {
  if (process.env.MAIL_TRANSPORT === 'log') return true;
  if (!process.env.MAIL_FROM) return false;
  return !!process.env.RESEND_API_KEY || !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function siteUrl(req: NextRequest): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.host;
  return `${proto}://${host}`;
}

interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail(mail: Mail): Promise<boolean> {
  try {
    if (process.env.MAIL_TRANSPORT === 'log') {
      const dir = path.join(process.cwd(), 'data', 'outbox');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${Date.now()}-${crypto.randomBytes(3).toString('hex')}.json`), JSON.stringify(mail, null, 2));
      return true;
    }
    const from = process.env.MAIL_FROM as string;
    if (process.env.RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
      });
      if (!res.ok) console.error('Resend error:', res.status, await res.text().catch(() => ''));
      return res.ok;
    }
    if (process.env.SMTP_HOST) {
      const nodemailer = (await import('nodemailer')).default;
      const port = Number(process.env.SMTP_PORT) || 587;
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({ from, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text });
      return true;
    }
  } catch (e) {
    console.error('Mail error:', e);
  }
  return false;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

// Gabarit commun : fond sombre, un titre, un texte et un bouton.
function layout(title: string, text: string, button: string, link: string, foot: string) {
  const brand = getSettings().general.brandName || 'YUFO The Jeweler';
  const html = `<!doctype html><html><body style="margin:0;background:#0a0a0b;padding:32px 16px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#e4e4e7">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:480px;background:#121214;border:1px solid #27272a;border-radius:16px" cellspacing="0" cellpadding="0"><tr><td style="padding:36px 32px">
<p style="margin:0 0 24px;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#a1a1aa">${esc(brand)}</p>
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:#ffffff;font-weight:600">${esc(title)}</h1>
<p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#a1a1aa">${esc(text)}</p>
<a href="${esc(link)}" style="display:inline-block;background:#ffffff;color:#09090b;text-decoration:none;font-weight:600;font-size:14px;padding:13px 26px;border-radius:999px">${esc(button)}</a>
<p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#71717a">${esc(foot)}<br><span style="word-break:break-all">${esc(link)}</span></p>
</td></tr></table></td></tr></table></body></html>`;
  const plain = `${title}\n\n${text}\n\n${button}: ${link}\n\n${foot}`;
  return { html, text: plain };
}

export function verifyEmailMail(to: string, link: string): Mail {
  return {
    to,
    subject: 'Confirm your email address',
    ...layout(
      'Confirm your email',
      'Welcome to the atelier. Confirm your email address to activate your account and keep your purchases in your library.',
      'Confirm my email',
      link,
      'This link expires in 48 hours. If you did not create an account, you can ignore this email.'
    ),
  };
}

export function resetPasswordMail(to: string, link: string): Mail {
  return {
    to,
    subject: 'Reset your password',
    ...layout(
      'Choose a new password',
      'We received a request to reset the password of your account. Use the button below to choose a new one.',
      'Choose a new password',
      link,
      'This link expires in 1 hour. If you did not ask for it, you can ignore this email: your password stays the same.'
    ),
  };
}
