import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserProfile } from '../../../../lib/usersDb';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1449069547876516106';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cookieId = req.cookies.get('yufo_auth_token')?.value;
  const id = searchParams.get('id') || cookieId;

  if (!id) {
    return NextResponse.json({ user: null });
  }

  const user = getUserById(id);
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
        res.cookies.delete('yufo_auth_token');
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
    const { id, pseudo, discordTag, fivemId, phone } = await req.json();
    const cookieId = req.cookies.get('yufo_auth_token')?.value;
    const targetId = id || cookieId;

    if (!targetId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const updated = updateUserProfile(targetId, { pseudo, discordTag, fivemId, phone });
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal Server Error' }, { status: 500 });
  }
}
