import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { canSendFiles, getViewer, loadTicket, postBlock } from '@/lib/tickets';
import { registerUpload } from '@/lib/ticketFiles';
import { getSettings } from '@/lib/settings';
import { TICKET_FILE_EXT } from '@/lib/ticketDefaults';
import { TICKET_FILES_DIR } from '@/lib/purge';
import { rateLimited } from '@/lib/rateLimit';

// Envoi d'un fichier dans un ticket (avant de publier le message qui le contient).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = loadTicket(id);
  const v = loaded ? getViewer(req, loaded.r) : null;
  if (!loaded || !v) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  const t = loaded.r.ticket!;
  const block = postBlock(t, v);
  if (block) return NextResponse.json({ error: block }, { status: 403 });
  if (!canSendFiles(t, v)) return NextResponse.json({ error: 'Files are turned off in this ticket.' }, { status: 403 });
  if (rateLimited(`ticketfile:${v.user.id}`, 20, 600000)) {
    return NextResponse.json({ error: 'Too many files sent. Please wait a few minutes.' }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  const maxMb = getSettings().tickets.maxFileMb;
  if (file.size > maxMb * 1024 * 1024) return NextResponse.json({ error: `File too large (${maxMb} MB max).` }, { status: 413 });
  const original = file.name.replace(/[\\/\0]/g, '_').slice(0, 120) || 'file';
  const ext = (original.split('.').pop() || '').toLowerCase();
  if (!TICKET_FILE_EXT.includes(ext)) {
    return NextResponse.json({ error: `This file type is not accepted (${TICKET_FILE_EXT.join(', ')}).` }, { status: 415 });
  }

  fs.mkdirSync(TICKET_FILES_DIR, { recursive: true });
  const stored = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(TICKET_FILES_DIR, stored), Buffer.from(await file.arrayBuffer()));
  const meta = { id: stored, name: original, size: file.size };
  registerUpload(meta, v.user.id, loaded.r.id);
  return NextResponse.json({ success: true, file: meta });
}
