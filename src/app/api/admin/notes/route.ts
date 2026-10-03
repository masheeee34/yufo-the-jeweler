import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { audit, can, getAdmin } from '@/lib/team';
import { getRequests, saveRequests } from '@/lib/requestsDb';
import { requestKind } from '@/lib/commerce';

// Notes internes sur une commande, un projet ou un ticket : jamais envoyées au client.
export async function POST(req: NextRequest) {
  const ctx = getAdmin(req);
  if (!ctx) return NextResponse.json({ error: 'Connexion administrateur requise.' }, { status: 401 });

  const { requestId, text } = await req.json();
  const clean = String(text || '').trim().slice(0, 2000);
  if (!clean) return NextResponse.json({ error: 'Note vide.' }, { status: 400 });

  const requests = getRequests();
  const r = requests.find((x) => x.id === requestId);
  if (!r) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const kind = requestKind(r);
  const perm = kind === 'order' ? 'orders' : kind === 'project' ? 'projects' : 'messages';
  if (!can(ctx.member.role, perm)) return NextResponse.json({ error: 'Accès refusé pour votre rôle.' }, { status: 403 });

  const note = { id: crypto.randomBytes(5).toString('hex'), by: ctx.user.pseudo, at: new Date().toISOString(), text: clean };
  r.internalNotes = [...(r.internalNotes || []), note];
  saveRequests(requests);
  audit(ctx, 'note.add', { target: r.id, detail: clean.slice(0, 120) });
  return NextResponse.json({ success: true, note });
}
