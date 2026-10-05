import { NextRequest, NextResponse } from 'next/server';
import { getSessionRecord, getSessionUser, revokeSessions } from '@/lib/session';
import { getStoredUser, setPassword } from '@/lib/usersDb';
import { passwordProblem, verifyPassword } from '@/lib/passwords';
import { rateLimited } from '@/lib/rateLimit';

// Changement de mot de passe depuis les réglages : les autres appareils sont déconnectés.
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  const session = getSessionRecord(req);
  if (!user || !session) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (rateLimited(`pwchange:${user.id}`, 6, 600000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const stored = getStoredUser(user.id)!;
  if (!stored.passwordHash || !verifyPassword(String(body.current ?? ''), stored).ok) {
    return NextResponse.json({ error: 'Your current password is not correct.' }, { status: 400 });
  }
  const problem = passwordProblem(body.next);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  setPassword(user.id, String(body.next));
  const closed = revokeSessions((s) => s.userId === user.id && s.id !== session.id);
  return NextResponse.json({ success: true, closed });
}
