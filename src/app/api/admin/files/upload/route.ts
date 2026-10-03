import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import { audit, requireAdmin } from '@/lib/team';
import { ALLOWED_EXT, currentVersion, ensureDir, extOf, FileAsset, getFiles, MAX_FILE_BYTES, newId, saveFiles, versionPath } from '@/lib/filesDb';

export const dynamic = 'force-dynamic';

// Envoi d'un fichier en flux (corps brut de la requête), écrit directement sur le disque.
// ?fileId=… ajoute une nouvelle version à un fichier existant ; sinon un nouveau fichier est créé (?name=…).
export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;

  const q = new URL(req.url).searchParams;
  const originalName = String(q.get('filename') || '').replace(/[^\w.\- ()]/g, '_').slice(0, 120);
  const ext = extOf(originalName);
  if (!originalName || !ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: `Format refusé. Formats acceptés : ${ALLOWED_EXT.join(', ')}` }, { status: 415 });
  }
  const declared = Number(req.headers.get('content-length') || 0);
  if (declared > MAX_FILE_BYTES) return NextResponse.json({ error: 'Fichier trop lourd (100 Mo maximum).' }, { status: 413 });
  if (!req.body) return NextResponse.json({ error: 'Fichier vide.' }, { status: 400 });

  const files = getFiles();
  const existingId = q.get('fileId');
  const asset: FileAsset | undefined = existingId ? files.find((f) => f.id === existingId && !f.deletedAt) : undefined;
  if (existingId && !asset) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });

  const fileId = asset?.id || newId('file');
  const v = asset ? currentVersion(asset).v + 1 : 1;
  const stored = `v${v}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  ensureDir(fileId);
  const dest = versionPath(fileId, stored);
  const tmp = `${dest}.part`;

  // Écriture en flux, avec calcul de l'empreinte et arrêt si la taille dépasse la limite.
  const hash = crypto.createHash('sha256');
  let size = 0;
  const out = fs.createWriteStream(tmp);
  try {
    const reader = req.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_FILE_BYTES) throw new Error('TOO_LARGE');
      hash.update(value);
      if (!out.write(value)) await new Promise<void>((r) => out.once('drain', () => r()));
    }
    await new Promise<void>((resolve, reject) => out.end((err?: Error | null) => (err ? reject(err) : resolve())));
  } catch (e: any) {
    out.destroy();
    fs.rmSync(tmp, { force: true });
    return NextResponse.json({ error: e.message === 'TOO_LARGE' ? 'Fichier trop lourd (100 Mo maximum).' : 'Envoi interrompu.' }, { status: e.message === 'TOO_LARGE' ? 413 : 400 });
  }
  if (size === 0) {
    fs.rmSync(tmp, { force: true });
    return NextResponse.json({ error: 'Fichier vide.' }, { status: 400 });
  }
  fs.renameSync(tmp, dest);

  const now = new Date().toISOString();
  const version = { v, stored, originalName, size, sha256: hash.digest('hex'), uploadedAt: now, uploadedBy: ctx.user.pseudo, note: String(q.get('note') || '').slice(0, 200) || undefined };
  // Relecture juste avant d'enregistrer : un autre envoi a pu se terminer pendant celui-ci.
  const fresh = getFiles();
  let saved = fresh.find((f) => f.id === fileId);
  if (saved) {
    version.v = currentVersion(saved).v + 1;
    saved.versions.push(version);
    saved.updatedAt = now;
    audit(ctx, 'file.version', { target: saved.name, detail: `v${version.v} · ${originalName}`, before: { version: version.v - 1 }, after: { version: version.v, size } });
  } else {
    saved = { id: fileId, name: String(q.get('name') || originalName).trim().slice(0, 100) || originalName, versions: [version], createdAt: now, updatedAt: now };
    fresh.unshift(saved);
    audit(ctx, 'file.upload', { target: saved.name, detail: `${originalName} · ${(size / 1048576).toFixed(1)} Mo` });
  }
  saveFiles(fresh);
  return NextResponse.json({ success: true, file: saved });
}
