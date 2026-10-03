import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getSessionUser } from '../../../lib/session';
import { MAX_UPLOAD_BYTES, UPLOADS_DIR, sniffImage } from '../../../lib/uploads';

// Envoi d'une image de référence pour une demande sur mesure (comptes Discord uniquement).
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user || !user.discordId) {
    return NextResponse.json({ error: 'Please sign in with Discord first.' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No image received.' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Image too large (8 MB max).' }, { status: 413 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const ext = sniffImage(buf);
    if (!ext) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP or GIF images are accepted.' }, { status: 415 });
    }

    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const name = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, name), buf);

    return NextResponse.json({ success: true, name, url: `/api/uploads/${name}` });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'The image could not be uploaded.' }, { status: 500 });
  }
}
