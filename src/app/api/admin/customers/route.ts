import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { audit, requireAdmin } from '@/lib/team';
import { getRequests } from '@/lib/requestsDb';
import { belongsTo, customerSummaries, orderInfo, projectInfo, requestKind } from '@/lib/commerce';
import { getCustomerRecord, getCustomerRecords, saveCustomerRecord } from '@/lib/customersDb';
import { getReviews } from '@/lib/reviewsDb';
import { getUserById } from '@/lib/usersDb';

export const dynamic = 'force-dynamic';

// Liste des clients, ou fiche détaillée avec ?id=
export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'customers');
  if (ctx instanceof NextResponse) return ctx;
  const requests = getRequests();
  const id = new URL(req.url).searchParams.get('id');
  const records = getCustomerRecords();

  if (!id) {
    const customers = customerSummaries(requests).map((c) => ({ ...c, tags: records[c.id]?.tags || [], discountPercent: records[c.id]?.discountPercent }));
    return NextResponse.json({ customers });
  }

  const user = getUserById(id);
  if (!user) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
  const mine = requests.filter((r) => belongsTo(r, user));
  const summary = customerSummaries(requests).find((c) => c.id === user.id);
  return NextResponse.json({
    customer: summary,
    record: getCustomerRecord(user.id),
    orders: mine.filter((r) => requestKind(r) === 'order').map((r) => ({ id: r.id, at: r.createdAt, ...orderInfo(r) })),
    projects: mine.filter((r) => requestKind(r) === 'project').map((r) => {
      const p = projectInfo(r);
      return { id: r.id, at: r.createdAt, piece: p.piece, stage: p.stage, price: p.price, paymentStatus: p.paymentStatus };
    }),
    tickets: mine.filter((r) => requestKind(r) === 'ticket').map((r) => ({ id: r.id, at: r.createdAt, subject: r.subject, status: r.status })),
    reviews: getReviews().filter((rv) => !rv.deletedAt && rv.pseudo.toLowerCase() === user.pseudo.toLowerCase()),
    // Fichiers possédés : livrables des projets terminés (le gestionnaire de fichiers complet arrive à l'étape suivante).
    files: mine.filter((r) => requestKind(r) === 'project').flatMap((r) => projectInfo(r).finalFiles.map((f) => ({ ...f, projectId: r.id }))),
  });
}

// Notes internes, tags et remise personnelle.
export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'customers');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();
  const user = getUserById(String(body.id || ''));
  if (!user) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });

  const rec = getCustomerRecord(user.id);
  const before = { tags: rec.tags, discountPercent: rec.discountPercent };
  if (Array.isArray(body.tags)) {
    rec.tags = [...new Set<string>(body.tags.map((t: unknown) => String(t).trim()).filter(Boolean))].slice(0, 10).map((t) => t.slice(0, 24));
  }
  if (body.discountPercent !== undefined) {
    const d = Number(body.discountPercent);
    rec.discountPercent = d > 0 ? Math.min(90, Math.round(d)) : undefined;
  }
  if (body.note) {
    rec.notes = [...rec.notes, { id: crypto.randomBytes(5).toString('hex'), by: ctx.user.pseudo, at: new Date().toISOString(), text: String(body.note).trim().slice(0, 2000) }];
  }
  // Nouvelle réduction (ou réduction plus forte) : le client est prévenu et la découvre en grattant une carte.
  if (rec.discountPercent && rec.discountPercent > (before.discountPercent || 0)) {
    rec.notifications = [
      { id: crypto.randomBytes(6).toString('hex'), type: 'discount' as const, title: 'You received a gift from YUFO', text: 'Scratch the card to reveal your personal discount.', percent: rec.discountPercent, at: new Date().toISOString() },
      ...(rec.notifications || []),
    ].slice(0, 30);
  }
  saveCustomerRecord(user.id, rec);
  const after = { tags: rec.tags, discountPercent: rec.discountPercent };
  if (JSON.stringify(before) !== JSON.stringify(after)) audit(ctx, 'customer.update', { target: user.pseudo, before, after });
  if (body.note) audit(ctx, 'customer.note', { target: user.pseudo });
  return NextResponse.json({ success: true, record: rec });
}
