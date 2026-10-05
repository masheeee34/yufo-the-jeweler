import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/session';
import { updateUserProfile } from '@/lib/usersDb';
import { MAX_UPLOAD_BYTES, UPLOADS_DIR, sniffImage } from '@/lib/uploads';

// Photo de profil facultative (sinon la première lettre du pseudo est affichée).
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image received.' }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'Image too large (8 MB max).' }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) return NextResponse.json({ error: 'Only JPG, PNG, WEBP or GIF images are accepted.' }, { status: 415 });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const name = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), buf);
  const updated = updateUserProfile(user.id, { avatarUrl: `/api/uploads/${name}` });
  return NextResponse.json({ success: true, user: updated });
}

export async function DELETE(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  const updated = updateUserProfile(user.id, { avatarUrl: null });
  return NextResponse.json({ success: true, user: updated });
}
