import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { canDownload, getViewer, loadTicket } from '@/lib/tickets';
import { TICKET_FILES_DIR, TICKET_FILE_NAME } from '@/lib/purge';

// Téléchargement d'un fichier du ticket : membres du ticket (si « Allow downloads ») et équipe.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  const { id, fileId } = await params;
  const loaded = loadTicket(id);
  const v = loaded ? getViewer(req, loaded.r) : null;
  if (!loaded || !v || !TICKET_FILE_NAME.test(fileId)) return new NextResponse('Not found', { status: 404 });
  if (!canDownload(loaded.r.ticket!, v)) return new NextResponse('Downloads are turned off in this ticket.', { status: 403 });

  // Le fichier doit appartenir à un message visible de ce ticket.
  const msg = loaded.r.messages.find((m) => (m.files || []).some((f) => f.id === fileId));
  if (!msg || msg.deletedAt || (msg.hidden && !v.canManage)) return new NextResponse('Not found', { status: 404 });
  const meta = msg.files!.find((f) => f.id === fileId)!;
  const full = path.join(TICKET_FILES_DIR, fileId);
  if (!fs.existsSync(full)) return new NextResponse('Not found', { status: 404 });

  const safeName = meta.name.replace(/[^\w.\- ]+/g, '_');
  return new NextResponse(fs.readFileSync(full), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(meta.name)}`,
      'Content-Length': String(meta.size),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
