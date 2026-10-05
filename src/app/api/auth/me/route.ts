import { NextRequest, NextResponse } from 'next/server';
import { isActive, updateUserProfile } from '@/lib/usersDb';
import { destroySession, getSessionUser, refreshSessionCookie } from '@/lib/session';
import { getSettings } from '@/lib/settings';
import { guildMembership } from '@/lib/discordGuild';
import { mailConfigured } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

// Profil du visiteur connecté (uniquement le sien : la session décide, pas un paramètre).
export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ user: null, mailReady: mailConfigured() });

  // Option « serveur Discord obligatoire » : ne concerne que les comptes qui n'ont que Discord pour se connecter.
  if (getSettings().security.discordGuildRequired && user.discordId && !user.hasPassword) {
    if ((await guildMembership(user.discordId)) === 'not_member') {
      const res = NextResponse.json({
        user: null,
        error: 'GUILD_MEMBERSHIP_REVOKED',
        message: 'Discord membership revoked. Please rejoin the server.',
      });
      destroySession(req, res);
      return res;
    }
  }

  const res = NextResponse.json({ user, active: isActive(user), mailReady: mailConfigured() });
  refreshSessionCookie(req, res);
  return res;
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    const { pseudo, discordTag, fivemId, phone } = await req.json();
    const updated = updateUserProfile(user.id, {
      pseudo: typeof pseudo === 'string' ? pseudo : undefined,
      discordTag: typeof discordTag === 'string' ? discordTag : undefined,
      fivemId: typeof fivemId === 'string' ? fivemId : undefined,
      phone: typeof phone === 'string' ? phone : undefined,
    });
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user: updated });
  } catch {
    return NextResponse.json({ error: 'Your profile could not be saved.' }, { status: 500 });
  }
}
