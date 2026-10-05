import { NextRequest, NextResponse } from 'next/server';
import { getRequests, saveRequests } from '@/lib/requestsDb';
import { getSessionUser } from '@/lib/session';
import { canSeeTicketList, ensureTicket, isTicketRequest, ticketSummary } from '@/lib/tickets';

export const dynamic = 'force-dynamic';

// Liste des tickets : les siens pour un client, tous pour l'équipe (filtres actifs / archivés / clôturés).
export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const staff = canSeeTicketList(req);
  const requests = getRequests();
  let changed = false;
  for (const r of requests) if (isTicketRequest(r) && ensureTicket(r)) changed = true;
  if (changed) saveRequests(requests);

  const view = req.nextUrl.searchParams.get('view') || 'active';
  const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  const scope = staff && req.nextUrl.searchParams.get('scope') !== 'mine' ? 'all' : 'mine';

  const tickets = requests
    .filter((r) => r.ticket)
    .filter((r) => scope === 'all' || r.ticket!.members.some((m) => m.userId === user.id && !m.revoked))
    .filter((r) => {
      const t = r.ticket!;
      if (view === 'archived') return t.archived;
      if (view === 'closed') return t.closed && !t.archived;
      if (view === 'all') return true;
      return !t.archived && !t.closed;
    })
    .filter((r) => !q || `${r.id} ${r.ticket!.title} ${r.pseudo}`.toLowerCase().includes(q))
    .sort((a, b) => b.ticket!.updatedAt.localeCompare(a.ticket!.updatedAt))
    .map((r) => ticketSummary(r, user.id));

  return NextResponse.json({ tickets, staff });
}
