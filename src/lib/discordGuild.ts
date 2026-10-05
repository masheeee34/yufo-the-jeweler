// Appartenance au serveur Discord de YUFO, vérifiée avec le bot (jeton dans l'environnement, jamais dans le code).
export const GUILD_ID = process.env.DISCORD_GUILD_ID || '1449069547876516106';
export const DISCORD_CLIENT_ID = '1551650954007548054';

type Membership = 'member' | 'not_member' | 'unknown';
const cache = new Map<string, { state: Membership; at: number }>();

// « unknown » quand la vérification est impossible (bot absent du serveur, Discord indisponible) :
// on ne bloque alors personne, plutôt que de déconnecter tout le monde.
export async function guildMembership(discordId: string): Promise<Membership> {
  const hit = cache.get(discordId);
  if (hit && Date.now() - hit.at < 10 * 60000) return hit.state;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return 'unknown';
  let state: Membership = 'unknown';
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${discordId}`, {
      headers: { Authorization: `Bot ${token}` },
    });
    if (res.ok) state = 'member';
    else if (res.status === 404) {
      const body = await res.json().catch(() => ({}));
      // 10007 = membre inconnu (pas sur le serveur) ; 10004 = serveur inconnu (le bot n'y est plus).
      state = body?.code === 10007 ? 'not_member' : 'unknown';
      if (state === 'unknown') console.error('Discord guild check unavailable:', body?.message || res.status);
    }
  } catch (e) {
    console.error('Discord guild check failed:', e);
  }
  cache.set(discordId, { state, at: Date.now() });
  return state;
}
