import { NextRequest, NextResponse } from 'next/server';
import { getTeam, requireAdmin, saveTeam } from '@/lib/team';
import { buildEvents } from '@/lib/adminData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'dashboard');
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json({ events: buildEvents(), seenAt: ctx.member.notificationsSeenAt || null });
}

// Tout marquer comme lu (propre à chaque membre).
export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'dashboard');
  if (ctx instanceof NextResponse) return ctx;
  const team = getTeam();
  const me = team.find((m) => m.discordId === ctx.member.discordId);
  if (me) {
    me.notificationsSeenAt = new Date().toISOString();
    saveTeam(team);
  }
  return NextResponse.json({ success: true, seenAt: me?.notificationsSeenAt });
}
