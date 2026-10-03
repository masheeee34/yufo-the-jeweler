import { NextRequest, NextResponse } from 'next/server';
import { audit, requireAdmin } from '@/lib/team';
import { getTaxonomy, saveTaxonomy, slugify, Taxonomy, TaxonomyItem } from '@/lib/taxonomy';
import { getProducts, saveProducts } from '@/lib/productsDb';

export const dynamic = 'force-dynamic';

type Kind = 'categories' | 'collections';
const isKind = (k: unknown): k is Kind => k === 'categories' || k === 'collections';

function withCounts(t: Taxonomy) {
  const products = getProducts().filter((p) => !p.deletedAt);
  const count = (kind: Kind, id: string) => products.filter((p) => (kind === 'categories' ? p.category : p.collection) === id).length;
  return {
    categories: t.categories.map((c) => ({ ...c, products: count('categories', c.id) })).sort((a, b) => a.order - b.order),
    collections: t.collections.map((c) => ({ ...c, products: count('collections', c.id) })).sort((a, b) => a.order - b.order),
  };
}

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  return NextResponse.json(withCounts(getTaxonomy()));
}

// Créer une catégorie ou une collection.
export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const { kind, label, description } = await req.json();
  if (!isKind(kind)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  const name = String(label || '').trim().slice(0, 60);
  if (!name) return NextResponse.json({ error: 'Nom requis' }, { status: 400 });

  const t = getTaxonomy();
  let id = slugify(name) || `item-${Date.now().toString(36)}`;
  while (t[kind].some((i) => i.id === id)) id = `${id}-${Math.random().toString(36).slice(2, 5)}`;
  const item: TaxonomyItem = { id, label: name, description: String(description || '').trim().slice(0, 240) || undefined, visible: true, order: t[kind].length };
  t[kind].push(item);
  saveTaxonomy(t);
  audit(ctx, kind === 'categories' ? 'category.create' : 'collection.create', { target: name });
  return NextResponse.json({ success: true, item });
}

// Modifier (nom, description, visibilité), réordonner, ou attribuer des créations à une collection/catégorie.
export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();
  if (!isKind(body.kind)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  const kind: Kind = body.kind;
  const t = getTaxonomy();

  if (Array.isArray(body.order)) {
    const ids: string[] = body.order.map(String);
    t[kind].forEach((i) => (i.order = ids.includes(i.id) ? ids.indexOf(i.id) : ids.length + i.order));
    saveTaxonomy(t);
    audit(ctx, `${kind === 'categories' ? 'category' : 'collection'}.reorder`);
    return NextResponse.json({ success: true });
  }

  const item = t[kind].find((i) => i.id === body.id);
  if (!item) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  const before = { ...item };

  if (body.label !== undefined) item.label = String(body.label).trim().slice(0, 60) || item.label;
  if (body.description !== undefined) item.description = String(body.description).trim().slice(0, 240) || undefined;
  if (body.visible !== undefined) item.visible = !!body.visible;
  if (body.restore) item.deletedAt = undefined;

  // Ajouter / retirer des créations
  if (Array.isArray(body.productIds)) {
    const ids = new Set<string>(body.productIds.map(String));
    const products = getProducts();
    const field = kind === 'categories' ? 'category' : 'collection';
    for (const p of products) {
      if (ids.has(p.id)) (p as any)[field] = item.id;
      else if ((p as any)[field] === item.id && kind === 'collections') p.collection = undefined;
    }
    saveProducts(products);
    audit(ctx, `${kind === 'categories' ? 'category' : 'collection'}.products`, { target: item.label, detail: `${ids.size} création(s)` });
  }

  saveTaxonomy(t);
  if (JSON.stringify(before) !== JSON.stringify(item)) {
    audit(ctx, `${kind === 'categories' ? 'category' : 'collection'}.update`, { target: item.label, before, after: { ...item } });
  }
  return NextResponse.json({ success: true, item });
}

// Corbeille (masquée du site, restaurable). Les créations gardent leur catégorie.
export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get('kind');
  if (!isKind(kind)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  const t = getTaxonomy();
  const item = t[kind].find((i) => i.id === searchParams.get('id'));
  if (!item) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  item.deletedAt = new Date().toISOString();
  saveTaxonomy(t);
  audit(ctx, `${kind === 'categories' ? 'category' : 'collection'}.trash`, { target: item.label });
  return NextResponse.json({ success: true });
}
