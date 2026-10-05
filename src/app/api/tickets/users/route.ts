import { NextRequest, NextResponse } from 'next/server';
import { canSeeTicketList } from '@/lib/tickets';
import { getUsers, normalizeUsername } from '@/lib/usersDb';
import { getTeam } from '@/lib/team';

export const dynamic = 'force-dynamic';

// Recherche d'un compte par @nom d'utilisateur (équipe uniquement, pour ajouter un membre à un ticket).
export async function GET(req: NextRequest) {
  if (!canSeeTicketList(req)) return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  const q = normalizeUsername(req.nextUrl.searchParams.get('q'));
  if (q.length < 1) return NextResponse.json({ users: [] });
  const team = new Set(getTeam().map((m) => m.discordId));
  const users = getUsers()
    .filter((u) => u.username && (u.username.startsWith(q) || u.pseudo.toLowerCase().includes(q)))
    .sort((a, b) => Number(!a.username!.startsWith(q)) - Number(!b.username!.startsWith(q)) || a.username!.length - b.username!.length)
    .slice(0, 8)
    .map((u) => ({
      id: u.id,
      username: u.username,
      name: u.pseudo,
      avatarUrl: u.avatarUrl || '',
      discordId: u.discordId || '',
      avatar: u.avatar || '',
      isTeam: !!u.discordId && team.has(u.discordId),
    }));
  return NextResponse.json({ users });
}
