import { NextRequest, NextResponse } from 'next/server';
import { audit, diff, requireAdmin } from '@/lib/team';
import { getProducts, addProduct, updateProduct, saveProducts } from '@/lib/productsDb';
import { Product, ProductStatus } from '@/lib/products';
import { getFiles } from '@/lib/filesDb';

export const dynamic = 'force-dynamic';

const STATUSES: ProductStatus[] = ['draft', 'published', 'hidden'];

// Champs modifiables depuis l'admin (tout le reste est ignoré).
function pickEditable(body: any): Partial<Product> {
  const out: Partial<Product> = {};
  const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  if (body.name !== undefined) out.name = str(body.name, 140);
  if (body.price !== undefined) out.price = Math.max(0, Number(body.price) || 0);
  if (body.shortDescription !== undefined) out.shortDescription = str(body.shortDescription, 300);
  if (body.fullDescription !== undefined) out.fullDescription = str(body.fullDescription, 5000);
  if (body.category !== undefined) out.category = str(body.category, 40);
  if (body.collection !== undefined) out.collection = str(body.collection, 40) || undefined;
  if (body.brand !== undefined) out.brand = str(body.brand, 80);
  if (body.reference !== undefined) out.reference = str(body.reference, 60);
  if (body.image !== undefined) out.image = str(body.image, 500);
  if (body.hoverImage !== undefined) out.hoverImage = str(body.hoverImage, 500);
  if (body.inStock !== undefined) out.inStock = !!body.inStock;
  if (body.featured !== undefined) out.featured = !!body.featured;
  if (body.allowSimilarProject !== undefined) out.allowSimilarProject = !!body.allowSimilarProject;
  if (body.status !== undefined && STATUSES.includes(body.status)) out.status = body.status;
  if (body.tags !== undefined) {
    const list = Array.isArray(body.tags) ? body.tags : String(body.tags).split(',');
    out.tags = [...new Set<string>(list.map((t: unknown) => String(t).trim().toLowerCase()).filter(Boolean))].slice(0, 15);
  }
  if (Array.isArray(body.gallery)) {
    out.gallery = body.gallery
      .map((g: unknown) => str(g, 500))
      .filter((g: string) => /^\/(api\/uploads|assets)\/[\w./-]+$/.test(g) || /^https:\/\/\S+$/i.test(g))
      .slice(0, 12);
  }
  if (Array.isArray(body.details)) {
    out.details = body.details
      .map((d: any) => ({ title: str(d?.title, 80), content: str(d?.content, 3000) }))
      .filter((d: { title: string; content: string }) => d.title && d.content)
      .slice(0, 12);
  }
  if (Array.isArray(body.fileIds)) {
    const known = new Set(getFiles().filter((f) => !f.deletedAt).map((f) => f.id));
    out.fileIds = [...new Set<string>(body.fileIds.map(String))].filter((id) => known.has(id));
  }
  if (body.specs && typeof body.specs === 'object') {
    out.specs = {
      material: str(body.specs.material, 120),
      stones: str(body.specs.stones, 120),
      compatibility: str(body.specs.compatibility, 160),
      delivery: str(body.specs.delivery, 160),
    };
  }
  return out;
}

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const products = getProducts()
    .map((p, i) => ({ ...p, status: p.status || 'published', sortOrder: p.sortOrder ?? i }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return NextResponse.json({ products });
}

// Création, ou action : duplicate / reorder / restore.
export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();

  if (body.action === 'reorder') {
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map(String) : [];
    const products = getProducts();
    const pos = new Map(ids.map((id, i) => [id, i]));
    products.forEach((p, i) => (p.sortOrder = pos.has(p.id) ? pos.get(p.id)! : ids.length + i));
    products.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    saveProducts(products);
    audit(ctx, 'product.reorder', { detail: `${ids.length} créations réordonnées` });
    return NextResponse.json({ success: true });
  }

  if (body.action === 'duplicate') {
    const src = getProducts().find((p) => p.id === body.id);
    if (!src) return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });
    const copy = addProduct({ ...src, name: `${src.name} (copy)`, reference: undefined, fullDescription: src.fullDescription });
    const product = updateProduct(copy.id, { status: 'draft', tags: src.tags, allowSimilarProject: src.allowSimilarProject, featured: false, updatedAt: new Date().toISOString() });
    audit(ctx, 'product.duplicate', { target: src.name, detail: `Copie créée en brouillon : ${copy.id}` });
    return NextResponse.json({ success: true, product });
  }

  if (body.action === 'restore') {
    const before = getProducts().find((p) => p.id === body.id);
    if (!before) return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });
    const product = updateProduct(body.id, { deletedAt: undefined, updatedAt: new Date().toISOString() });
    audit(ctx, 'product.restore', { target: before.name });
    return NextResponse.json({ success: true, product });
  }

  const fields = pickEditable(body);
  if (!fields.name || fields.price === undefined || !fields.fullDescription) {
    return NextResponse.json({ error: 'Le titre, le prix et la description sont obligatoires.' }, { status: 400 });
  }
  const created = addProduct({
    name: fields.name,
    price: fields.price,
    shortDescription: fields.shortDescription,
    fullDescription: fields.fullDescription,
    category: fields.category || 'pendants',
    collection: fields.collection,
    brand: fields.brand,
    reference: fields.reference,
    image: fields.image,
    hoverImage: fields.hoverImage,
    specs: fields.specs,
    inStock: fields.inStock,
    featured: fields.featured,
  });
  const product = updateProduct(created.id, {
    status: fields.status || 'draft',
    tags: fields.tags || [],
    allowSimilarProject: fields.allowSimilarProject ?? true,
    sortOrder: -1,
    updatedAt: new Date().toISOString(),
  });
  audit(ctx, 'product.create', { target: created.name, after: { price: created.price, status: product?.status } });
  return NextResponse.json({ success: true, product });
}

export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();
  const before = getProducts().find((p) => p.id === body.id);
  if (!before) return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });

  const product = updateProduct(body.id, { ...pickEditable(body), updatedAt: new Date().toISOString() });
  if (!product) return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });
  const { updatedAt: _a, priceDisplay: _b, ...b } = before;
  const { updatedAt: _c, priceDisplay: _d, ...a } = product;
  const changes = diff(b as Record<string, any>, a as Record<string, any>);
  if (changes) audit(ctx, 'product.update', { target: product.name, ...changes });
  return NextResponse.json({ success: true, product });
}

// Corbeille par défaut ; ?permanent=1 supprime définitivement (Founder et Admin, depuis la corbeille).
export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const products = getProducts();
  const target = products.find((p) => p.id === id);
  if (!target) return NextResponse.json({ error: 'Création introuvable' }, { status: 404 });

  if (searchParams.get('permanent') === '1') {
    if (!['founder', 'admin'].includes(ctx.member.role)) return NextResponse.json({ error: 'Réservé aux Founders et Admins.' }, { status: 403 });
    if (!target.deletedAt) return NextResponse.json({ error: 'Mettez d’abord la création à la corbeille.' }, { status: 409 });
    saveProducts(products.filter((p) => p.id !== id));
    audit(ctx, 'product.delete_permanent', { target: target.name, before: { price: target.price, reference: target.reference } });
    return NextResponse.json({ success: true });
  }

  updateProduct(target.id, { deletedAt: new Date().toISOString() });
  audit(ctx, 'product.trash', { target: target.name });
  return NextResponse.json({ success: true });
}
