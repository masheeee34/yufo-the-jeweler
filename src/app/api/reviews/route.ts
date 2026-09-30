import { NextResponse } from 'next/server';
import { getReviews } from '@/lib/reviewsDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = getReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
