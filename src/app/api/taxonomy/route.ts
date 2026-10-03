import { NextResponse } from 'next/server';
import { publicTaxonomy } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(publicTaxonomy());
}
