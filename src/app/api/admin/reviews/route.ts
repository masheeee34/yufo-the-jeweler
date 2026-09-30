import { NextRequest, NextResponse } from 'next/server';
import { getReviews, addReview, deleteReview, updateReview } from '@/lib/reviewsDb';

const ADMIN_PASS = process.env.ADMIN_PASSWORD;

function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-key');
  return !!ADMIN_PASS && token === ADMIN_PASS;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  const reviews = getReviews();
  return NextResponse.json({ success: true, reviews });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { pseudo, date, message, rating, isVerified } = body;

    if (!pseudo || !message) {
      return NextResponse.json({ error: 'Le pseudo et le message sont requis' }, { status: 400 });
    }

    const newReview = addReview({
      pseudo,
      date,
      message,
      rating: rating ? Number(rating) : 5,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
    });

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const ok = deleteReview(id);
    if (!ok) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const updated = updateReview(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, review: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur interne' }, { status: 500 });
  }
}
