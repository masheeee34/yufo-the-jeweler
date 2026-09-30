import { NextRequest, NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/productsDb';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function verifyAdmin(request: NextRequest): boolean {
  const token = request.headers.get('x-admin-key');
  return !!ADMIN_SECRET && token === ADMIN_SECRET;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const products = getProducts();
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || body.price === undefined || !body.fullDescription) {
      return NextResponse.json(
        { error: 'Le titre, le prix et la description sont obligatoires.' },
        { status: 400 }
      );
    }

    const product = addProduct({
      name: body.name,
      price: Number(body.price),
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      category: body.category || 'pendants',
      collection: body.collection || 'essence',
      brand: body.brand,
      reference: body.reference,
      image: body.image,
      hoverImage: body.hoverImage,
      specs: body.specs,
      inStock: body.inStock,
      featured: body.featured,
    });

    return NextResponse.json({ success: true, product });
  } catch (e: any) {
    console.error('Error creating product:', e);
    return NextResponse.json({ error: e.message || 'Erreur creation produit' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
    }

    const product = updateProduct(body.id, body);
    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (e: any) {
    console.error('Error updating product:', e);
    return NextResponse.json({ error: e.message || 'Erreur mise a jour produit' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID produit requis' }, { status: 400 });
  }

  const ok = deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: 'Produit introuvable ou echec suppression' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
