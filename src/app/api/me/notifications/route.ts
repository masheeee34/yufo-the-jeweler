import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getCustomerRecord, saveCustomerRecord } from '@/lib/customersDb';

export const dynamic = 'force-dynamic';

// Notifications du client connecté (cloche de l'en-tête).
export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ notifications: [], discountPercent: 0 });
  const rec = getCustomerRecord(user.id);
  const notifications = (rec.notifications || [])
    .filter((n) => !n.dismissed)
    // Le pourcentage d'une réduction n'est envoyé qu'une fois la carte grattée.
    .map((n) => (n.type === 'discount' && !n.revealed ? { ...n, percent: undefined } : n));
  // Tant que la carte n'est pas grattée, le pourcentage reste une surprise (la commande l'applique quand même).
  const surprise = (rec.notifications || []).some((n) => n.type === 'discount' && !n.revealed && !n.dismissed);
  return NextResponse.json({ notifications, discountPercent: surprise ? 0 : rec.discountPercent || 0 });
}

// Marquer comme lue, révéler une réduction (carte grattée) ou retirer une notification.
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { id, action } = await req.json();
  const rec = getCustomerRecord(user.id);
  const list = rec.notifications || [];
  const targets = id === 'all' ? list : list.filter((n) => n.id === id);
  if (!targets.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  for (const n of targets) {
    if (action === 'read') n.read = true;
    else if (action === 'reveal') { n.revealed = true; n.read = true; }
    else if (action === 'dismiss') n.dismissed = true;
  }
  saveCustomerRecord(user.id, rec);
  const n = targets[0];
  return NextResponse.json({ success: true, notification: action === 'reveal' ? n : undefined });
}
