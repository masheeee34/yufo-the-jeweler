const DISCORD_CLIENT_ID = '1551650954007548054';

// Connexion Discord, puis retour automatique vers la page demandée (lu par la page de retour Discord).
export function startDiscordLogin(returnTo: string) {
  try {
    sessionStorage.setItem('yufo_return_to', returnTo);
  } catch {}
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/discord/callback`);
  window.location.href = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&scope=identify&redirect_uri=${redirectUri}`;
}
