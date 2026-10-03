import { NextRequest, NextResponse } from 'next/server';
import { audit, canManage, createInvitation, getInvitations, invitationState, requireAdmin, ROLES, saveInvitations } from '@/lib/team';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'team');
  if (ctx instanceof NextResponse) return ctx;
  const invitations = getInvitations().map((i) => ({ ...i, state: invitationState(i) }));
  return NextResponse.json({ invitations, assignableRoles: ROLES.filter((r) => canManage(ctx.member.role, r)) });
}

// Créer une invitation (lien à usage unique, valable 7 jours).
export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'team');
  if (ctx instanceof NextResponse) return ctx;
  const { role } = await req.json();
  if (!ROLES.includes(role) || !canManage(ctx.member.role, role)) {
    return NextResponse.json({ error: 'Votre rôle ne permet pas d’inviter à ce rôle.' }, { status: 403 });
  }
  const inv = createInvitation(role, ctx.user.pseudo);
  audit(ctx, 'invitation.create', { detail: `Rôle ${role}` });
  return NextResponse.json({ success: true, invitation: { ...inv, state: invitationState(inv) } });
}

export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'team');
  if (ctx instanceof NextResponse) return ctx;
  const code = new URL(req.url).searchParams.get('code');
  const list = getInvitations();
  const inv = list.find((i) => i.code === code);
  if (!inv) return NextResponse.json({ error: 'Invitation introuvable' }, { status: 404 });
  inv.revoked = true;
  saveInvitations(list);
  audit(ctx, 'invitation.revoke', { detail: `Rôle ${inv.role}` });
  return NextResponse.json({ success: true });
}
