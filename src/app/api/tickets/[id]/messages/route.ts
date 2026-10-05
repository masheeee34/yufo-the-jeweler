import { NextRequest, NextResponse } from 'next/server';
import { saveRequests } from '@/lib/requestsDb';
import { canSendFiles, canSendImages, getViewer, loadTicket, notifyMembers, postBlock, serializeTicket, touch } from '@/lib/tickets';
import { takeUploads } from '@/lib/ticketFiles';
import { isImageUpload, MAX_ATTACHMENTS, uploadExists } from '@/lib/uploads';
import { rateLimited } from '@/lib/rateLimit';

// Nouveau message dans un ticket (texte, images et/ou fichiers selon les permissions du ticket).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = loadTicket(id);
  const v = loaded ? getViewer(req, loaded.r) : null;
  if (!loaded || !v) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  const { requests, r } = loaded;
  const t = r.ticket!;

  const block = postBlock(t, v);
  if (block) return NextResponse.json({ error: block }, { status: 403 });
  if (rateLimited(`ticketmsg:${v.user.id}`, 20, 60000)) {
    return NextResponse.json({ error: 'You are sending messages too quickly.' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? '').trim().slice(0, 4000);
  const wantsImages = Array.isArray(body.images) && body.images.length > 0;
  const wantsFiles = Array.isArray(body.files) && body.files.length > 0;
  if (wantsImages && !canSendImages(t, v)) return NextResponse.json({ error: 'Images are turned off in this ticket.' }, { status: 403 });
  if (wantsFiles && !canSendFiles(t, v)) return NextResponse.json({ error: 'Files are turned off in this ticket.' }, { status: 403 });

  const images = wantsImages
    ? [...new Set<string>(body.images.map((x: unknown) => String(x)))].filter((n) => isImageUpload(n) && uploadExists(n)).slice(0, MAX_ATTACHMENTS)
    : [];
  const files = wantsFiles ? takeUploads(body.files, v.user.id, r.id) : [];
  if (!text && !images.length && !files.length) return NextResponse.json({ error: 'Write a message first.' }, { status: 400 });

  const staff = v.canManage;
  const now = new Date().toISOString();
  r.messages.push({
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sender: staff ? 'admin' : 'client',
    authorId: v.user.id,
    authorName: v.user.pseudo,
    text,
    createdAt: now,
    ...(images.length ? { attachments: images } : {}),
    ...(files.length ? { files } : {}),
  });
  // Statut de la conversation utilisé par le back-office (réponse attendue ou non).
  r.status = staff ? 'answered' : 'pending';
  touch(r);
  saveRequests(requests);

  const preview = text ? text.slice(0, 120) : images.length ? 'Sent an image' : 'Sent a file';
  notifyMembers(r, v.user.id, `New message · ${t.title}`, `${v.user.pseudo}: ${preview}`, `${r.id}:msg`);

  return NextResponse.json({ success: true, ticket: serializeTicket(r, v) });
}
