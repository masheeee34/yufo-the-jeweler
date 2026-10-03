import { NextRequest, NextResponse } from 'next/server';
import { audit, canManage, getTeam, requireAdmin, Role, ROLE_PERMISSIONS, ROLES, saveTeam } from '@/lib/team';
import { getUsers } from '@/lib/usersDb';
import { getSessions, revokeSessions } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'team');
  if (ctx instanceof NextResponse) return ctx;
  const users = getUsers();
  const sessions = getSessions();
  const members = getTeam().map((m) => {
    const u = users.find((x) => x.discordId === m.discordId);
    const last = sessions.filter((s) => s.userId === u?.id).map((s) => s.lastSeenAt).sort().pop();
    return { ...m, pseudo: u?.pseudo || 'Not signed in yet', avatar: u?.avatar, lastSeenAt: last, manageable: canManage(ctx.member.role, m.role) && m.discordId !== ctx.member.discordId };
  });
  return NextResponse.json({ members, me: ctx.member.discordId, myRole: ctx.member.role, rolePermissions: ROLE_PERMISSIONS });
}

// Changer le rôle d'un membre.
export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'team');
  if (ctx instanceof NextResponse) return ctx;
  const { discordId, role } = await req.json();
  if (!ROLES.includes(role)) return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
  const team = getTeam();
  const m = team.find((x) => x.discordId === discordId);
  if (!m) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
  if (m.discordId === ctx.member.discordId) return NextResponse.json({ error: 'Vous ne pouvez pas changer votre propre rôle.' }, { status: 400 });
  if (!canManage(ctx.member.role, m.role) || !canManage(ctx.member.role, role as Role)) {
    return NextResponse.json({ error: 'Votre rôle ne permet pas ce changement.' }, { status: 403 });
  }
  const before = m.role;
  m.role = role;
  saveTeam(team);
  audit(ctx, 'team.role', { target: discordId, before: { role: before }, after: { role } });
  return NextResponse.json({ success: true });
}

// Retirer un membre du back-office (ses sessions admin sont coupées).
export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'team');
  if (ctx instanceof NextResponse) return ctx;
  const discordId = new URL(req.url).searchParams.get('discordId');
  const team = getTeam();
  const m = team.find((x) => x.discordId === discordId);
  if (!m) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
  if (m.discordId === ctx.member.discordId) return NextResponse.json({ error: 'Vous ne pouvez pas vous retirer vous-même.' }, { status: 400 });
  if (!canManage(ctx.member.role, m.role)) return NextResponse.json({ error: 'Votre rôle ne permet pas ce retrait.' }, { status: 403 });
  if (m.role === 'founder' && team.filter((x) => x.role === 'founder').length <= 1) {
    return NextResponse.json({ error: 'Il doit rester au moins un Founder.' }, { status: 400 });
  }
  saveTeam(team.filter((x) => x.discordId !== discordId));
  const u = getUsers().find((x) => x.discordId === discordId);
  if (u) revokeSessions((s) => s.userId === u.id);
  audit(ctx, 'team.remove', { target: u?.pseudo || discordId!, before: { role: m.role } });
  return NextResponse.json({ success: true });
}
