import { NextRequest, NextResponse } from 'next/server';
import { can, getAdmin } from '@/lib/team';
import { getRequests } from '@/lib/requestsDb';
import { getProducts } from '@/lib/productsDb';
import { getUsers } from '@/lib/usersDb';
import { requestKind } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

// Recherche globale (barre ⌘K) : créations, commandes, projets, tickets, clients, selon les droits du rôle.
export async function GET(req: NextRequest) {
  const ctx = getAdmin(req);
  if (!ctx) return NextResponse.json({ error: 'Connexion administrateur requise.' }, { status: 401 });
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });
  const role = ctx.member.role;
  const has = (s: string | undefined) => !!s && s.toLowerCase().includes(q);
  const results: { type: string; label: string; sub?: string; href: string }[] = [];

  if (can(role, 'store')) {
    for (const p of getProducts()) {
      if (has(p.name) || has(p.reference) || p.tags?.some(has)) results.push({ type: 'Creation', label: p.name, sub: `${p.reference} · $${p.price}`, href: `/admin/creations?id=${p.id}` });
    }
  }
  for (const r of getRequests()) {
    const kind = requestKind(r);
    const perm = kind === 'order' ? 'orders' : kind === 'project' ? 'projects' : 'messages';
    if (!can(role, perm)) continue;
    if (has(r.id) || has(r.pseudo) || has(r.subject)) {
      const href = kind === 'order' ? `/admin/orders?id=${r.id}` : kind === 'project' ? `/admin/projects?id=${r.id}` : `/admin/messages?id=${r.id}`;
      results.push({ type: kind === 'order' ? 'Order' : kind === 'project' ? 'Custom project' : 'Ticket', label: r.id, sub: `${r.pseudo} · ${r.subject.slice(0, 60)}`, href });
    }
  }
  if (can(role, 'customers')) {
    for (const u of getUsers()) {
      if (has(u.pseudo) || has(u.discordTag) || has(u.discordId) || (!u.email.endsWith('@discord.user') && has(u.email))) {
        results.push({ type: 'Customer', label: u.pseudo, sub: u.discordTag, href: `/admin/customers?id=${u.id}` });
      }
    }
  }
  return NextResponse.json({ results: results.slice(0, 25) });
}
