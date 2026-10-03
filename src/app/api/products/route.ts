import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/productsDb';

export const dynamic = 'force-dynamic';

// Catalogue public : seulement les créations publiées, hors corbeille, dans l'ordre choisi dans l'admin.
export async function GET() {
  try {
    const products = getProducts()
      .map((p, i) => ({ p, order: p.sortOrder ?? i }))
      .filter(({ p }) => (p.status || 'published') === 'published' && !p.deletedAt)
      .sort((a, b) => a.order - b.order)
      // Les fichiers livrables ne sont jamais exposés publiquement.
      .map(({ p }) => { const { fileIds: _f, ...pub } = p; return pub; });
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
