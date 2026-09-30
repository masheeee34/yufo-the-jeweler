import { NextRequest, NextResponse } from 'next/server';
import { getRequests, saveRequests, ChatMessage } from '../../../../lib/requestsDb';

const ADMIN_PASS = process.env.ADMIN_PASSWORD;

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-key');
  return !!ADMIN_PASS && token === ADMIN_PASS;
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
    const { requestId, replyText } = await req.json();
    if (!requestId || !replyText) {
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
      text: String(replyText).trim(),
      createdAt: new Date().toISOString(),
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
    const { requestId, status } = await req.json();
    const requests = getRequests();
    const found = requests.find((r) => r.id === requestId);
    if (!found) {
      return NextResponse.json({ error: 'Requête introuvable' }, { status: 404 });
    }

    if (['pending', 'answered', 'closed'].includes(status)) {
      found.status = status;
      saveRequests(requests);
    }

    return NextResponse.json({ success: true, request: found });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Error' }, { status: 500 });
  }
}
