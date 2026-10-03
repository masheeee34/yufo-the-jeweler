import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '../../../../lib/usersDb';
import { destroySession, getSessionUser } from '../../../../lib/session';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1449069547876516106';

// Profil du visiteur connecté (uniquement le sien : la session décide, pas un paramètre).
export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  // Guild Watchdog Security Check
  if (user.discordId) {
    try {
      const checkRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${user.discordId}`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
      });

      if (checkRes.status === 404) {
        // User is no longer in Discord server: revoke active session!
        const res = NextResponse.json({
          user: null,
          error: 'GUILD_MEMBERSHIP_REVOKED',
          message: 'Discord membership revoked. Please rejoin the server.',
        });
        destroySession(req, res);
        return res;
      }
    } catch (watchdogErr) {
      console.error('Watchdog check error:', watchdogErr);
    }
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const { pseudo, discordTag, fivemId, phone } = await req.json();
    const updated = updateUserProfile(user.id, { pseudo, discordTag, fivemId, phone });
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
