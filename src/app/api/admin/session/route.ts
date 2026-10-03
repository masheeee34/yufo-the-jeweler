import { NextRequest, NextResponse } from 'next/server';
import { getAdmin, ROLE_PERMISSIONS } from '@/lib/team';
import { getSessionUser } from '@/lib/session';
import { sidebarCounts } from '@/lib/adminData';

export const dynamic = 'force-dynamic';

// Qui est connecté au back-office, avec quels droits, et les compteurs de la barre latérale.
export async function GET(req: NextRequest) {
  const admin = getAdmin(req);
  if (!admin) {
    const user = getSessionUser(req);
    return NextResponse.json(
      { error: user ? 'NOT_TEAM_MEMBER' : 'NOT_SIGNED_IN', user: user ? { pseudo: user.pseudo } : null },
      { status: user ? 403 : 401 }
    );
  }
  return NextResponse.json({
    user: {
      id: admin.user.id,
      pseudo: admin.user.pseudo,
      discordId: admin.user.discordId,
      avatar: admin.user.avatar,
    },
    role: admin.member.role,
    permissions: ROLE_PERMISSIONS[admin.member.role],
    counts: sidebarCounts(admin.member.notificationsSeenAt),
  });
}
