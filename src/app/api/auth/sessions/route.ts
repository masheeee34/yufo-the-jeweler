import { NextRequest, NextResponse } from 'next/server';
import { getSessionRecord, getUserSessions, revokeSessions, sessionPublicId } from '@/lib/session';

// Appareils connectés au compte : liste et déconnexion d'un appareil précis.
function device(ua = '') {
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac OS X/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Unknown device';
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\//.test(ua)
      ? 'Opera'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Chrome\//.test(ua)
          ? 'Chrome'
          : /Safari\//.test(ua)
            ? 'Safari'
            : 'Browser';
  return `${browser} · ${os}`;
}

// Adresse IP en partie masquée : assez pour reconnaître un appareil, sans l'afficher en entier.
const maskIp = (ip?: string) => {
  if (!ip) return '';
  const v4 = ip.match(/^(\d+)\.(\d+)\.\d+\.\d+$/);
  return v4 ? `${v4[1]}.${v4[2]}.x.x` : `${ip.split(':').slice(0, 3).join(':')}:…`;
};

export async function GET(req: NextRequest) {
  const current = getSessionRecord(req);
  if (!current) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const sessions = getUserSessions(current.userId)
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
    .map((s) => ({
      id: sessionPublicId(s),
      device: device(s.userAgent),
      ip: maskIp(s.ip),
      lastSeenAt: s.lastSeenAt,
      createdAt: s.createdAt,
      current: s.id === current.id,
    }));
  return NextResponse.json({ sessions });
}

export async function DELETE(req: NextRequest) {
  const current = getSessionRecord(req);
  if (!current) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const closed = revokeSessions((s) => s.userId === current.userId && sessionPublicId(s) === id);
  return NextResponse.json({ success: true, closed });
}
