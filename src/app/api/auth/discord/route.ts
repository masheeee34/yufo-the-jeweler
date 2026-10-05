import { NextRequest, NextResponse } from 'next/server';
import { linkDiscord, unlinkDiscord, upsertDiscordUser } from '@/lib/usersDb';
import { createSession, getSessionUser } from '@/lib/session';
import { getSettings } from '@/lib/settings';
import { DISCORD_CLIENT_ID, guildMembership } from '@/lib/discordGuild';

// Connexion avec Discord (facultative), ou liaison de Discord à un compte e-mail déjà ouvert.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let token: string | undefined = body.accessToken || undefined;

    if (!token && body.code && process.env.DISCORD_CLIENT_SECRET) {
      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: 'authorization_code',
          code: String(body.code),
          redirect_uri: `${req.nextUrl.origin}/api/auth/discord/callback`,
        }),
      });
      const tokenData = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || !tokenData.access_token) {
        return NextResponse.json({ success: false, error: 'Discord sign-in failed. Please try again.' }, { status: 400 });
      }
      token = tokenData.access_token;
    }
    if (!token) return NextResponse.json({ success: false, error: 'No Discord access token provided.' }, { status: 400 });

    const userRes = await fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bearer ${token}` } });
    if (!userRes.ok) return NextResponse.json({ success: false, error: 'Invalid or expired Discord session.' }, { status: 401 });
    const discordUser = await userRes.json();
    const displayName = discordUser.global_name || discordUser.username;

    // Option du back-office : réserver la connexion Discord aux membres du serveur.
    const settings = getSettings();
    if (settings.security.discordGuildRequired && (await guildMembership(discordUser.id)) === 'not_member') {
      return NextResponse.json(
        {
          success: false,
          error: 'NOT_IN_GUILD',
          message: 'You must be a member of the official YUFO Discord community to sign in with Discord.',
          inviteUrl: settings.general.discordInvite,
        },
        { status: 403 }
      );
    }

    // Liaison à un compte déjà connecté (réglages du compte).
    if (body.link) {
      const current = getSessionUser(req);
      if (!current) return NextResponse.json({ success: false, error: 'Please sign in to your account first.' }, { status: 401 });
      const { user, error } = linkDiscord(current.id, discordUser.id, discordUser.username, discordUser.avatar || undefined);
      return user ? NextResponse.json({ success: true, user, linked: true }) : NextResponse.json({ success: false, error }, { status: 409 });
    }

    const profile = upsertDiscordUser(discordUser.id, displayName, discordUser.avatar, undefined, discordUser.username);
    const res = NextResponse.json({ success: true, user: profile });
    createSession(req, res, profile.id, true);
    return res;
  } catch (error) {
    console.error('Discord Auth Error:', error);
    return NextResponse.json({ success: false, error: 'Discord sign-in failed. Please try again.' }, { status: 500 });
  }
}

// Retirer Discord du compte (possible seulement avec une adresse vérifiée et un mot de passe).
export async function DELETE(req: NextRequest) {
  const current = getSessionUser(req);
  if (!current) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const { user, error } = unlinkDiscord(current.id);
  return user ? NextResponse.json({ success: true, user }) : NextResponse.json({ error }, { status: 400 });
}
