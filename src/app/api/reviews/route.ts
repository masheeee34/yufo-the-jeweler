import { NextResponse } from 'next/server';
import { getReviews } from '@/lib/reviewsDb';

export const dynamic = 'force-dynamic';

// Avis publics : ni masqués ni à la corbeille ; les avis mis en avant passent en premier.
export async function GET() {
  try {
    const reviews = getReviews()
      .filter((r) => !r.hidden && !r.deletedAt)
      .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
      .map(({ orderId: _o, ...r }) => r);
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
