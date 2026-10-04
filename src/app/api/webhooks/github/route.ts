import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// Salon Discord #github du serveur YUFO : le bot y annonce chaque mise à jour du dépôt.
const CHANNEL_ID = process.env.GITHUB_DISCORD_CHANNEL_ID || '1555586866374512670';

// GitHub signe chaque envoi avec le secret partagé : on refuse tout ce qui n'est pas signé correctement.
function validSignature(raw: string, header: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !header?.startsWith('sha256=')) return false;
  const expected = Buffer.from('sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex'));
  const got = Buffer.from(header);
  return got.length === expected.length && crypto.timingSafeEqual(got, expected);
}

async function post(body: unknown) {
  const res = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('GitHub → Discord :', res.status, await res.text());
  return res.ok;
}

const firstLine = (s: string) => (s.split('\n')[0] || '').slice(0, 90);

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get('x-hub-signature-256'))) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
  }
  if (!process.env.DISCORD_BOT_TOKEN) return NextResponse.json({ error: 'Bot non configuré' }, { status: 500 });

  const event = req.headers.get('x-github-event');
  const p = JSON.parse(raw);

  // Envoi de test de GitHub à la création du webhook.
  if (event === 'ping') {
    await post({ embeds: [{ color: 0x2ecc71, description: `✅ Notifications GitHub connectées pour **${p.repository?.full_name || 'le dépôt'}**.` }] });
    return NextResponse.json({ ok: true });
  }

  if (event !== 'push' || !Array.isArray(p.commits) || p.commits.length === 0) return NextResponse.json({ ignored: true });

  const branch = String(p.ref || '').replace('refs/heads/', '');
  const commits = p.commits as { id: string; url: string; message: string; author?: { name?: string } }[];
  const lines = commits.slice(-10).map((c) => `[\`${c.id.slice(0, 7)}\`](${c.url}) ${firstLine(c.message)}`);
  if (commits.length > 10) lines.unshift(`… et ${commits.length - 10} autre(s)`);

  const ok = await post({
    embeds: [
      {
        color: 0xffffff,
        author: { name: p.pusher?.name || p.sender?.login || 'GitHub', icon_url: p.sender?.avatar_url },
        title: `Mise à jour du site · ${commits.length} modification${commits.length > 1 ? 's' : ''}`,
        url: p.compare,
        description: lines.join('\n'),
        footer: { text: `${p.repository?.full_name || ''} · ${branch}` },
        timestamp: p.head_commit?.timestamp || new Date().toISOString(),
      },
    ],
  });
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
