import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getRequests, saveRequests, ClientRequest } from '../../../lib/requestsDb';
import { getSessionUser } from '../../../lib/session';
import { getSettings } from '../../../lib/settings';
import { MAX_ATTACHMENTS, uploadExists } from '../../../lib/uploads';

const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

// Demande de projet sur mesure, envoyée par l'assistant pas à pas de /custom-orders.
// Réservée aux comptes connectés avec Discord : l'atelier répond ensuite depuis le site.
export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user || !user.discordId) {
      return NextResponse.json(
        { error: 'Please sign in with Discord before sending a custom request.' },
        { status: 401 }
      );
    }

    if (getSettings().customOrders.mode === 'closed') {
      return NextResponse.json({ error: 'Custom orders are closed for the moment. Join our Discord to be notified.' }, { status: 403 });
    }

    const body = await req.json();
    const category = clean(body.category, 120);
    const pedTarget = clean(body.pedTarget, 60);
    const vision = clean(body.vision, 4000);
    const referencedPiece = clean(body.referencedPiece, 120);
    const duration = clean(body.duration, 30);
    const budget = clean(body.budget, 30);
    // Images envoyées au préalable via /api/uploads : on ne garde que des noms valides et existants.
    const attachments = Array.isArray(body.attachments)
      ? [...new Set<string>(body.attachments.map((a: unknown) => String(a)))].filter(uploadExists).slice(0, MAX_ATTACHMENTS)
      : [];

    if (!category || vision.length < 15) {
      return NextResponse.json(
        { error: 'Please choose a type of piece and describe your vision.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const inquiryId = `YUF-INQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const newRequest: ClientRequest = {
      id: inquiryId,
      pseudo: user.pseudo,
      discordId: user.discordId,
      subject: `[Custom Project] ${category} · ${budget} · ${duration}`,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      project: { stage: 'brief', previews: [], finalFiles: [], updatedAt: now.toISOString() },
      messages: [
        {
          id: `msg_${Date.now()}_1`,
          sender: 'client',
          text: [
            `CLIENT: ${user.pseudo}`,
            `DISCORD: ${user.discordTag || user.pseudo} (${user.discordId})`,
            `PIECE: ${category}`,
            `WORN BY: ${pedTarget}`,
            `DELIVERY: ${duration}`,
            `BUDGET: ${budget}`,
            referencedPiece ? `INSPIRED BY: ${referencedPiece}` : null,
            '',
            'VISION:',
            vision,
            attachments.length ? `\nREFERENCE IMAGES: ${attachments.length}` : null,
          ].filter((l) => l !== null).join('\n'),
          createdAt: now.toISOString(),
          ...(attachments.length ? { attachments } : {}),
        },
      ],
    };

    const requests = getRequests();
    requests.unshift(newRequest);
    saveRequests(requests);

    return NextResponse.json({ success: true, inquiryId, request: newRequest });
  } catch (error: any) {
    console.error('Error handling custom request:', error);
    return NextResponse.json({ error: 'Your request could not be sent. Please try again.' }, { status: 500 });
  }
}
