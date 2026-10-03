import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { requireAdmin } from '@/lib/team';
import { getFiles, versionPath } from '@/lib/filesDb';
import { streamFile } from '@/lib/fileStream';

export const dynamic = 'force-dynamic';

// Téléchargement d'une version par l'équipe (?id=…&v=…, dernière version par défaut).
export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const q = new URL(req.url).searchParams;
  const f = getFiles().find((x) => x.id === q.get('id'));
  if (!f) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  const ver = q.get('v') ? f.versions.find((x) => x.v === Number(q.get('v'))) : f.versions[f.versions.length - 1];
  if (!ver) return NextResponse.json({ error: 'Version introuvable' }, { status: 404 });
  const p = versionPath(f.id, ver.stored);
  if (!fs.existsSync(p)) return NextResponse.json({ error: 'Fichier absent du disque' }, { status: 410 });
  return streamFile(p, ver.originalName, ver.size);
}
