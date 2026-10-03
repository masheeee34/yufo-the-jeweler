import { NextRequest, NextResponse } from 'next/server';
import { audit, can, getAdmin } from '../../../../lib/team';
import { MAX_ATTACHMENTS, uploadExists } from '../../../../lib/uploads';
import { getRequests, saveRequests, ChatMessage } from '../../../../lib/requestsDb';

// Accès réservé aux membres de l'équipe connectés avec Discord (voir lib/team.ts).
function isAuthorized(req: NextRequest): boolean {
  const admin = getAdmin(req);
  return !!admin && can(admin.member.role, 'messages');
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const requests = getRequests();
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { requestId, replyText, attachments } = await req.json();
    const files: string[] = Array.isArray(attachments) ? attachments.map(String).filter(uploadExists).slice(0, MAX_ATTACHMENTS) : [];
    if (!requestId || (!replyText && files.length === 0)) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const requests = getRequests();
    const found = requests.find((r) => r.id === requestId);
    if (!found) {
      return NextResponse.json({ error: 'Requête introuvable' }, { status: 404 });
    }

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: 'admin',
      text: String(replyText || '').trim(),
      createdAt: new Date().toISOString(),
      ...(files.length ? { attachments: files } : {}),
    };

    found.messages.push(newMsg);
    found.status = 'answered';
    saveRequests(requests);

    return NextResponse.json({ success: true, request: found });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { requestId, status, ticketType, linkedId } = await req.json();
    const requests = getRequests();
    const found = requests.find((r) => r.id === requestId);
    if (!found) {
      return NextResponse.json({ error: 'Requête introuvable' }, { status: 404 });
    }

    const before = { status: found.status, ticketType: found.ticketType, linkedId: found.linkedId };
    // pending = Open, answered = Waiting for customer, closed = Resolved
    if (['pending', 'answered', 'closed'].includes(status)) found.status = status;
    if (['custom', 'order', 'general'].includes(ticketType)) found.ticketType = ticketType;
    if (linkedId !== undefined) {
      if (linkedId && !requests.some((r) => r.id === linkedId)) {
        return NextResponse.json({ error: 'Commande ou projet introuvable' }, { status: 404 });
      }
      found.linkedId = linkedId || undefined;
    }
    saveRequests(requests);
    const admin = getAdmin(req);
    if (admin) audit(admin, 'ticket.update', { target: found.id, before, after: { status: found.status, ticketType: found.ticketType, linkedId: found.linkedId } });

    return NextResponse.json({ success: true, request: found });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 });
  }
}
