import { NextRequest, NextResponse } from 'next/server';
import { audit, requireAdmin } from '@/lib/team';
import { getFiles, getGrants, productsUsing, saveFiles } from '@/lib/filesDb';

export const dynamic = 'force-dynamic';

// Liste des fichiers avec leurs versions, les créations qui les utilisent et le nombre d'accès clients.
export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const grants = getGrants();
  const files = getFiles().map((f) => ({
    ...f,
    products: productsUsing(f.id),
    activeGrants: grants.filter((g) => g.fileId === f.id && !g.revokedAt).length,
    downloads: grants.filter((g) => g.fileId === f.id).reduce((s, g) => s + g.downloads, 0),
  }));
  return NextResponse.json({ files });
}

// Renommer / décrire, ou restaurer depuis la corbeille.
export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();
  const files = getFiles();
  const f = files.find((x) => x.id === body.id);
  if (!f) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  const before = { name: f.name, description: f.description, deletedAt: f.deletedAt };
  if (body.name !== undefined) f.name = String(body.name).trim().slice(0, 100) || f.name;
  if (body.description !== undefined) f.description = String(body.description).trim().slice(0, 300) || undefined;
  if (body.restore) f.deletedAt = undefined;
  f.updatedAt = new Date().toISOString();
  saveFiles(files);
  audit(ctx, body.restore ? 'file.restore' : 'file.update', { target: f.name, before, after: { name: f.name, description: f.description } });
  return NextResponse.json({ success: true, file: f });
}

// Corbeille : le fichier n'est plus proposable, mais les clients qui y ont accès le gardent.
export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'store');
  if (ctx instanceof NextResponse) return ctx;
  const id = new URL(req.url).searchParams.get('id');
  const files = getFiles();
  const f = files.find((x) => x.id === id);
  if (!f) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  f.deletedAt = new Date().toISOString();
  saveFiles(files);
  audit(ctx, 'file.trash', { target: f.name });
  return NextResponse.json({ success: true });
}
