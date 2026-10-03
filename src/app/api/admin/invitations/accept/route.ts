import { NextRequest, NextResponse } from 'next/server';
import { audit, getInvitations, getTeam, invitationState, saveInvitations, saveTeam } from '@/lib/team';
import { getSessionUser } from '@/lib/session';

// Rejoindre l'équipe avec un lien d'invitation (connexion Discord obligatoire).
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user?.discordId) return NextResponse.json({ error: 'NOT_SIGNED_IN' }, { status: 401 });

  const { code } = await req.json();
  const list = getInvitations();
  const inv = list.find((i) => i.code === code);
  if (!inv || invitationState(inv) !== 'pending') {
    return NextResponse.json({ error: 'Cette invitation est invalide, expirée ou déjà utilisée.' }, { status: 410 });
  }
  const team = getTeam();
  if (team.some((m) => m.discordId === user.discordId)) {
    return NextResponse.json({ error: 'Vous faites déjà partie de l’équipe.' }, { status: 409 });
  }
  team.push({ discordId: user.discordId, role: inv.role, addedAt: new Date().toISOString(), addedBy: inv.createdBy });
  saveTeam(team);
  inv.usedBy = user.pseudo;
  inv.usedAt = new Date().toISOString();
  saveInvitations(list);
  audit({ user }, 'team.join', { detail: `Rôle ${inv.role}, invité par ${inv.createdBy}` });
  return NextResponse.json({ success: true, role: inv.role });
}
