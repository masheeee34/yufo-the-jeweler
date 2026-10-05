import { NextRequest, NextResponse } from 'next/server';
import { consumeToken } from '@/lib/authTokens';
import { getUserById, markEmailVerified, normEmail } from '@/lib/usersDb';
import { getSessionUser } from '@/lib/session';
import { claimGuestPurchases } from '@/lib/purchases';

// Lien reçu par e-mail : confirme l'adresse, puis rattache les achats faits en invité avec cette adresse.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const t = consumeToken('verify', body.token);
  const user = t ? getUserById(t.userId) : null;
  // L'adresse ne doit pas avoir changé depuis l'envoi du lien.
  if (!t || !user || normEmail(user.email) !== normEmail(t.email)) {
    return NextResponse.json({ error: 'This link is invalid or has expired. Ask for a new one from your account.' }, { status: 400 });
  }
  const verified = markEmailVerified(user.id)!;
  const claimed = claimGuestPurchases(verified);
  const current = getSessionUser(req);
  const signedIn = current?.id === user.id;
  return NextResponse.json({ success: true, claimed, signedIn, user: signedIn ? verified : undefined });
}
