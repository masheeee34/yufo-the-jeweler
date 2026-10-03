import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { currentVersion, getFiles, getGrants } from '@/lib/filesDb';

export const dynamic = 'force-dynamic';

// « My files » : les fichiers auxquels le client connecté a accès.
export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const files = getFiles();
  const list = getGrants()
    .filter((g) => g.userId === user.id && !g.revokedAt)
    .map((g) => {
      const f = files.find((x) => x.id === g.fileId);
      if (!f) return null;
      const v = currentVersion(f);
      return { id: g.id, name: f.name, description: f.description, version: v.v, fileName: v.originalName, size: v.size, updatedAt: f.updatedAt, grantedAt: g.grantedAt };
    })
    .filter(Boolean);
  return NextResponse.json({ files: list });
}
