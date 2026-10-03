import { NextRequest, NextResponse } from 'next/server';
import { audit, diff, requireAdmin } from '@/lib/team';
import { getReviews, addReview, saveReviews, ReviewItem } from '@/lib/reviewsDb';
import { getRequests } from '@/lib/requestsDb';
import { isPaid, orderInfo, projectInfo, requestKind } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

// Un avis est « achat vérifié » s'il est relié à une commande ou un projet réellement payé.
function paidOrder(orderId?: string): boolean {
  if (!orderId) return false;
  const r = getRequests().find((x) => x.id === orderId);
  if (!r) return false;
  if (requestKind(r) === 'order') return isPaid(orderInfo(r).paymentStatus);
  if (requestKind(r) === 'project') return isPaid(projectInfo(r).paymentStatus);
  return false;
}

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'reviews');
  if (ctx instanceof NextResponse) return ctx;
  // Anciens avis sans origine : importés depuis Discord.
  const reviews = getReviews().map((r) => ({ ...r, source: r.source || 'imported' }));
  return NextResponse.json({ success: true, reviews, canEditVerified: ctx.member.role === 'founder' });
}

export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'reviews');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();

  if (body.action === 'restore') {
    const reviews = getReviews();
    const r = reviews.find((x) => x.id === body.id);
    if (!r) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    r.deletedAt = undefined;
    saveReviews(reviews);
    audit(ctx, 'review.restore', { target: `${r.pseudo} (${r.id})` });
    return NextResponse.json({ success: true, review: r });
  }

  const pseudo = str(body.pseudo, 60);
  const message = str(body.message, 1500);
  if (!pseudo || !message) return NextResponse.json({ error: 'Le pseudo et le message sont requis' }, { status: 400 });

  const orderId = str(body.orderId, 40) || undefined;
  const verified = paidOrder(orderId);
  const review = addReview({ pseudo, date: str(body.date, 40), message, rating: Number(body.rating) || 5, isVerified: verified });
  const reviews = getReviews();
  const saved = reviews.find((r) => r.id === review.id)!;
  saved.source = verified ? 'verified' : body.source === 'imported' ? 'imported' : 'manual';
  saved.productId = str(body.productId, 80) || undefined;
  saved.orderId = orderId;
  saved.updatedAt = new Date().toISOString();
  saveReviews(reviews);
  audit(ctx, 'review.create', { target: `${pseudo} (${saved.id})`, after: { rating: saved.rating, message, source: saved.source } });
  return NextResponse.json({ success: true, review: saved }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'reviews');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();
  const reviews = getReviews();
  const r = reviews.find((x) => x.id === body.id);
  if (!r) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });

  const before: ReviewItem = JSON.parse(JSON.stringify(r));
  if (body.pseudo !== undefined) r.pseudo = str(body.pseudo, 60) || r.pseudo;
  if (body.message !== undefined) r.message = str(body.message, 1500) || r.message;
  if (body.date !== undefined) r.date = str(body.date, 40);
  if (body.rating !== undefined) r.rating = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5)));
  if (body.hidden !== undefined) r.hidden = !!body.hidden;
  if (body.featured !== undefined) r.featured = !!body.featured;
  if (body.productId !== undefined) r.productId = str(body.productId, 80) || undefined;
  if (body.orderId !== undefined) {
    r.orderId = str(body.orderId, 40) || undefined;
    if (paidOrder(r.orderId)) {
      r.isVerified = true;
      r.source = 'verified';
    }
  }
  if (body.reply !== undefined) {
    const text = str(body.reply, 1000);
    r.reply = text ? { text, by: ctx.user.pseudo, at: new Date().toISOString() } : undefined;
  }
  // Statut « vérifié » manuel : Founder uniquement (anciens avis importés), toujours tracé.
  if (body.isVerified !== undefined && !!body.isVerified !== r.isVerified) {
    if (ctx.member.role !== 'founder') return NextResponse.json({ error: 'Seul un Founder peut modifier le statut vérifié.' }, { status: 403 });
    r.isVerified = !!body.isVerified;
  }
  r.updatedAt = new Date().toISOString();
  saveReviews(reviews);

  const { updatedAt: _a, ...b } = before;
  const { updatedAt: _b, ...a } = r;
  const changes = diff(b as Record<string, any>, a as Record<string, any>);
  if (changes) audit(ctx, 'isVerified' in changes.after ? 'review.verified_status' : 'review.update', { target: `${r.pseudo} (${r.id})`, ...changes });
  return NextResponse.json({ success: true, review: r });
}

// Corbeille par défaut ; ?permanent=1 depuis la corbeille.
export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'reviews');
  if (ctx instanceof NextResponse) return ctx;
  const { searchParams } = new URL(req.url);
  const reviews = getReviews();
  const r = reviews.find((x) => x.id === searchParams.get('id'));
  if (!r) return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });

  if (searchParams.get('permanent') === '1') {
    if (!r.deletedAt) return NextResponse.json({ error: 'Mettez d’abord l’avis à la corbeille.' }, { status: 409 });
    saveReviews(reviews.filter((x) => x.id !== r.id));
    audit(ctx, 'review.delete_permanent', { target: `${r.pseudo} (${r.id})`, before: { message: r.message, rating: r.rating } });
    return NextResponse.json({ success: true });
  }
  r.deletedAt = new Date().toISOString();
  saveReviews(reviews);
  audit(ctx, 'review.trash', { target: `${r.pseudo} (${r.id})` });
  return NextResponse.json({ success: true });
}
