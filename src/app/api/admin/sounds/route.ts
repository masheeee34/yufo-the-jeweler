import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { audit, requireAdmin } from '@/lib/team';
import { UPLOADS_DIR, sniffAudio } from '@/lib/uploads';

// Son de notification personnalisé (MP3, WAV ou OGG, 1 Mo au plus), choisi ensuite dans Settings › Tickets.
export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'settings');
  if (ctx instanceof NextResponse) return ctx;
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  if (file.size > 1024 * 1024) return NextResponse.json({ error: 'Son trop lourd (1 Mo maximum).' }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffAudio(buf);
  if (!ext) return NextResponse.json({ error: 'Formats acceptés : MP3, WAV ou OGG.' }, { status: 415 });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const name = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buf);
  audit(ctx, 'settings.sound.upload', { detail: file.name.slice(0, 80) });
  return NextResponse.json({ success: true, url: `/api/uploads/${name}` });
}
