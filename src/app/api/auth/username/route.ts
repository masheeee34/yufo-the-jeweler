import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { normalizeUsername, setUsername, usernameProblem } from '@/lib/usersDb';
import { clientIp, rateLimited } from '@/lib/rateLimit';

// Disponibilité d'un @nom d'utilisateur (vérifiée pendant la saisie).
export async function GET(req: NextRequest) {
  if (rateLimited(`uname:${clientIp(req)}`, 60, 60000)) {
    return NextResponse.json({ available: false, error: 'Slow down a little.' }, { status: 429 });
  }
  const user = getSessionUser(req);
  const name = normalizeUsername(req.nextUrl.searchParams.get('u'));
  const problem = usernameProblem(name, user?.id);
  return NextResponse.json({ username: name, available: !problem, error: problem });
}

// Choix (ou changement) du @nom d'utilisateur, obligatoire après la vérification de l'e-mail.
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (!user.emailVerified && !user.discordId) {
    return NextResponse.json({ error: 'Confirm your email address first.' }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { user: updated, error } = setUsername(user.id, String(body.username ?? ''));
  return updated ? NextResponse.json({ success: true, user: updated }) : NextResponse.json({ error }, { status: 400 });
}
