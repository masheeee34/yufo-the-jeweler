import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getSessionUser } from '@/lib/session';
import { currentVersion, getFiles, getGrants, saveGrants, versionPath } from '@/lib/filesDb';
import { streamFile } from '@/lib/fileStream';

export const dynamic = 'force-dynamic';

// Téléchargement par le client : uniquement son propre accès, non révoqué, toujours la dernière version.
export async function GET(req: NextRequest, { params }: { params: Promise<{ grantId: string }> }) {
  const { grantId } = await params;
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

  const grants = getGrants();
  const g = grants.find((x) => x.id === grantId && x.userId === user.id && !x.revokedAt);
  if (!g) return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  const f = getFiles().find((x) => x.id === g.fileId);
  if (!f) return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  const v = currentVersion(f);
  const p = versionPath(f.id, v.stored);
  if (!fs.existsSync(p)) return NextResponse.json({ error: 'File temporarily unavailable.' }, { status: 410 });

  g.downloads += 1;
  g.lastDownloadAt = new Date().toISOString();
  saveGrants(grants);
  return streamFile(p, v.originalName, v.size);
}
