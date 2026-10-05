import { NextRequest, NextResponse } from 'next/server';
import { destroySession, getSessionUser, revokeSessions } from '@/lib/session';

// Déconnexion de tous les appareils (utile si le compte a pu être utilisé par quelqu'un d'autre).
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const closed = revokeSessions((s) => s.userId === user.id);
  const res = NextResponse.json({ success: true, closed });
  destroySession(req, res);
  return res;
}
