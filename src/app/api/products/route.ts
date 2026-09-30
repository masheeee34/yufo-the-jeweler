import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/productsDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
