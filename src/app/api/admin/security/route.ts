import { NextRequest, NextResponse } from 'next/server';
import { audit, getTeam, requireAdmin } from '@/lib/team';
import { getSessions, revokeSessions } from '@/lib/session';
import { getUsers } from '@/lib/usersDb';

export const dynamic = 'force-dynamic';

// Sessions ouvertes des membres de l'équipe.
export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'security');
  if (ctx instanceof NextResponse) return ctx;
  const teamIds = new Set(getTeam().map((m) => m.discordId));
  const users = getUsers();
  const sessions = getSessions()
    .map((s) => {
      const u = users.find((x) => x.id === s.userId);
      return { id: s.id.slice(0, 16), userId: s.userId, pseudo: u?.pseudo || '?', team: !!u?.discordId && teamIds.has(u.discordId), createdAt: s.createdAt, lastSeenAt: s.lastSeenAt, expiresAt: s.expiresAt, ip: s.ip, userAgent: s.userAgent, current: s.id === ctx.sessionId };
    })
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  return NextResponse.json({ sessions, totalCustomerSessions: sessions.filter((s) => !s.team).length });
}

// Couper une session (?id=), toutes les autres sessions de l'équipe (?scope=team), ou tout le monde (?scope=all).
export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'security');
  if (ctx instanceof NextResponse) return ctx;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const scope = searchParams.get('scope');
  let n = 0;
  if (id) {
    n = revokeSessions((s) => s.id.startsWith(id) && s.id !== ctx.sessionId);
  } else if (scope === 'team') {
    const teamUserIds = new Set(getUsers().filter((u) => u.discordId && getTeam().some((m) => m.discordId === u.discordId)).map((u) => u.id));
    n = revokeSessions((s) => teamUserIds.has(s.userId) && s.id !== ctx.sessionId);
  } else if (scope === 'all') {
    n = revokeSessions((s) => s.id !== ctx.sessionId);
  } else {
    return NextResponse.json({ error: 'Paramètre manquant' }, { status: 400 });
  }
  audit(ctx, 'security.revoke_sessions', { detail: `${n} session(s) coupée(s)${scope ? ` (${scope})` : ''}` });
  return NextResponse.json({ success: true, revoked: n });
}
