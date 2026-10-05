import { NextRequest, NextResponse } from 'next/server';
import { consumeToken } from '@/lib/authTokens';
import { getUserById, markEmailVerified, normEmail, setPassword } from '@/lib/usersDb';
import { createSession, revokeSessions } from '@/lib/session';
import { passwordProblem } from '@/lib/passwords';
import { claimGuestPurchases } from '@/lib/purchases';

// Nouveau mot de passe depuis le lien reçu par e-mail : toutes les anciennes sessions sont fermées.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const problem = passwordProblem(body.password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  const t = consumeToken('reset', body.token);
  const user = t ? getUserById(t.userId) : null;
  if (!t || !user || normEmail(user.email) !== normEmail(t.email)) {
    return NextResponse.json({ error: 'This link is invalid or has expired. Ask for a new one.' }, { status: 400 });
  }
  setPassword(user.id, String(body.password));
  // Ouvrir ce lien prouve que l'adresse appartient bien au client.
  const verified = markEmailVerified(user.id)!;
  claimGuestPurchases(verified);
  revokeSessions((s) => s.userId === user.id);
  const res = NextResponse.json({ success: true, user: verified });
  createSession(req, res, user.id, true);
  return res;
}
