import { NextRequest, NextResponse } from 'next/server';
import { saveRequests } from '@/lib/requestsDb';
import { getViewer, loadTicket, logEvent, serializeTicket, touch } from '@/lib/tickets';
import { audit } from '@/lib/team';

// Modération d'un message : réservée à l'équipe. Modifier : seulement ses propres messages.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; msgId: string }> }) {
  const { id, msgId } = await params;
  const loaded = loadTicket(id);
  const v = loaded ? getViewer(req, loaded.r) : null;
  if (!loaded || !v) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  if (!v.canManage || !v.admin) return NextResponse.json({ error: 'Only the YUFO team can do this.' }, { status: 403 });

  const { requests, r } = loaded;
  const t = r.ticket!;
  const m = r.messages.find((x) => x.id === msgId);
  if (!m) return NextResponse.json({ error: 'Message not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');
  const by = v.user.pseudo;

  if (action === 'edit') {
    if (m.authorId !== v.user.id || m.sender !== 'admin') {
      return NextResponse.json({ error: 'You can only edit your own messages.' }, { status: 403 });
    }
    const text = String(body.text ?? '').trim().slice(0, 4000);
    if (!text) return NextResponse.json({ error: 'The message cannot be empty.' }, { status: 400 });
    m.text = text;
    m.editedAt = new Date().toISOString();
  } else if (action === 'hide' || action === 'unhide') {
    m.hidden = action === 'hide';
    logEvent(r, by, action === 'hide' ? 'Hid a message' : 'Made a message visible again');
  } else if (action === 'pin' || action === 'unpin') {
    t.pinned = t.pinned.filter((x) => x !== m.id);
    if (action === 'pin') t.pinned.unshift(m.id);
    t.pinned = t.pinned.slice(0, 10);
    logEvent(r, by, action === 'pin' ? 'Pinned a message' : 'Unpinned a message');
  } else if (action === 'delete') {
    m.deletedAt = new Date().toISOString();
    m.deletedBy = by;
    m.text = '';
    m.attachments = [];
    m.files = [];
    t.pinned = t.pinned.filter((x) => x !== m.id);
    logEvent(r, by, 'Deleted a message');
    if (v.admin) audit(v.admin, 'ticket.message.delete', { target: r.id });
  } else {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  }

  touch(r);
  saveRequests(requests);
  return NextResponse.json({ success: true, ticket: serializeTicket(r, v) });
}
