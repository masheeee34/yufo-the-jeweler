import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getViewer, loadTicket, serializeTicket } from '@/lib/tickets';

export const dynamic = 'force-dynamic';

// Un ticket, tel que ce visiteur a le droit de le voir. ?etag=… : renvoie « unchanged » si rien n'a bougé
// (y compris les messages ajoutés depuis les pages Projects / Messages du back-office).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = loadTicket(id);
  const viewer = loaded ? getViewer(req, loaded.r) : null;
  if (!loaded || !viewer) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  const ticket = serializeTicket(loaded.r, viewer);
  const etag = crypto.createHash('sha1').update(JSON.stringify(ticket)).digest('hex').slice(0, 20);
  if (req.nextUrl.searchParams.get('etag') === etag) return NextResponse.json({ unchanged: true, etag });
  return NextResponse.json({ ticket: { ...ticket, etag } });
}
