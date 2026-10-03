import { NextRequest, NextResponse } from 'next/server';
import { getRequests, saveRequests, ClientRequest, ChatMessage } from '../../../lib/requestsDb';
import { belongsTo, publicRequest } from '../../../lib/commerce';
import { getSessionUser } from '../../../lib/session';

// Les projets et commandes sont rattachés à un compte : seul leur propriétaire connecté y accède.
// Les conversations anonymes du chat (req_…) restent accessibles par leur identifiant.
function canAccess(req: NextRequest, r: ClientRequest) {
  if (r.id.startsWith('req_')) return true;
  const user = getSessionUser(req);
  return !!user && belongsTo(r, user);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing request ID' }, { status: 400 });
  }

  const requests = getRequests();
  const found = requests.find((r) => r.id === id);

  if (!found || !canAccess(req, found)) {
    return NextResponse.json({ error: 'Conversation non trouvée ou expirée (72h)' }, { status: 404 });
  }

  return NextResponse.json({ request: publicRequest(found) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const requests = getRequests();
    const now = new Date();

    // Cas 1 : Relance / Nouveau message dans conversation existante
    if (body.id && body.message) {
      const found = requests.find((r) => r.id === body.id);
      if (!found || !canAccess(req, found)) {
        return NextResponse.json({ error: 'Conversation expirée ou introuvable' }, { status: 404 });
      }

      const newMsg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: 'client',
        text: String(body.message).trim(),
        createdAt: now.toISOString(),
      };

      found.messages.push(newMsg);
      found.status = 'pending'; // Passe en attente de réponse admin
      saveRequests(requests);

      return NextResponse.json({ success: true, request: publicRequest(found) });
    }

    // Cas 2 : Nouvelle requête (pseudo, sujet, message)
    const { pseudo, subject, message } = body;
    if (!pseudo || !subject || !message) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
    const newRequest: ClientRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pseudo: String(pseudo).trim(),
      subject: String(subject).trim(),
      createdAt: now.toISOString(),
      expiresAt,
      status: 'pending',
      messages: [
        {
          id: `msg_${Date.now()}_1`,
          sender: 'client',
          text: String(message).trim(),
          createdAt: now.toISOString(),
        },
      ],
    };

    requests.unshift(newRequest);
    saveRequests(requests);

    return NextResponse.json({ success: true, request: publicRequest(newRequest) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
