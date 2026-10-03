import { NextResponse } from 'next/server';
import { publicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(publicSettings());
}
