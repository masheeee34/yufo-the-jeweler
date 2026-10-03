import { NextRequest, NextResponse } from 'next/server';
import { upsertDiscordUser } from '../../../../lib/usersDb';
import { createSession } from '../../../../lib/session';

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1449069547876516106';
const INVITE_URL = 'https://discord.gg/yufothejeweler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, code } = body;

    let token = accessToken;

    // If code is provided and DISCORD_CLIENT_SECRET is available
    if (!token && code) {
      const clientId = '1551650954007548054';
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = body.redirectUri || `${req.nextUrl.origin}/api/auth/discord/callback`;

      if (clientSecret) {
        const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
          }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) {
          return NextResponse.json(
            { success: false, error: tokenData.error_description || 'Failed to exchange authorization code with Discord.' },
            { status: 400 }
          );
        }
        token = tokenData.access_token;
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No Discord access token provided.' },
        { status: 400 }
      );
    }

    // 1. Fetch user info from Discord
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired Discord session.' },
        { status: 401 }
      );
    }

    const discordUser = await userRes.json();

    // 2. Verify guild membership in Yufo The Jeweler (1449069547876516106)
    const memberRes = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordUser.id}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });

    if (memberRes.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_IN_GUILD',
          message: 'You must be a member of the official Yufo The Jeweler Discord community to access your account.',
          inviteUrl: INVITE_URL,
        },
        { status: 403 }
      );
    }

    if (!memberRes.ok) {
      console.error('Error verifying guild member:', await memberRes.text());
      return NextResponse.json(
        { success: false, error: 'Discord guild verification temporarily unavailable.' },
        { status: 500 }
      );
    }

    const memberData = await memberRes.json();
    const effectiveName = memberData.nick || discordUser.global_name || discordUser.username;

    // 3. Upsert user in local database
    const userProfile = upsertDiscordUser(
      discordUser.id,
      effectiveName,
      discordUser.avatar,
      discordUser.email
    );

    // 4. Set session cookie
    const response = NextResponse.json({
      success: true,
      user: userProfile,
    });

    createSession(req, response, userProfile.id);

    return response;
  } catch (error: any) {
    console.error('Discord Auth Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
