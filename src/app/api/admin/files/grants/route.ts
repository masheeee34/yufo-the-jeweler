import { NextRequest, NextResponse } from 'next/server';
import { audit, can, getAdmin } from '@/lib/team';
import { getFiles, getGrants, grantAccess, grantForOrder, ownerOf, saveGrants } from '@/lib/filesDb';
import { getRequests, saveRequests } from '@/lib/requestsDb';
import { getUserById, getUsers } from '@/lib/usersDb';
import { orderInfo, requestKind } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

const allowed = (req: NextRequest) => {
  const ctx = getAdmin(req);
  if (!ctx) return { error: NextResponse.json({ error: 'Connexion administrateur requise.' }, { status: 401 }) };
  if (!['store', 'orders', 'customers', 'projects'].some((p) => can(ctx.member.role, p as any))) {
    return { error: NextResponse.json({ error: 'Accès refusé pour votre rôle.' }, { status: 403 }) };
  }
  return { ctx };
};

// Accès clients, filtrables par fichier (?fileId), client (?userId) ou commande/projet (?refId).
export async function GET(req: NextRequest) {
  const { ctx, error } = allowed(req);
  if (error) return error;
  const q = new URL(req.url).searchParams;
  const files = getFiles();
  const users = getUsers();
  let grants = getGrants();
  if (q.get('fileId')) grants = grants.filter((g) => g.fileId === q.get('fileId'));
  if (q.get('userId')) grants = grants.filter((g) => g.userId === q.get('userId'));
  if (q.get('refId')) {
    // Pour une commande : ses accès, ou à défaut ceux du client qui l'a passée.
    const r = getRequests().find((x) => x.id === q.get('refId'));
    const owner = r ? ownerOf(r) : null;
    grants = grants.filter((g) => g.refId === q.get('refId') || (owner && g.userId === owner.id));
  }
  void ctx;
  return NextResponse.json({
    grants: grants.map((g) => {
      const f = files.find((x) => x.id === g.fileId);
      const u = users.find((x) => x.id === g.userId);
      return { ...g, fileName: f?.name || '?', fileVersion: f?.versions[f.versions.length - 1]?.v, customer: u?.pseudo || '?' };
    }),
  });
}

// Donner un accès à la main ({ fileId, userId }), relancer les accès d'une commande ({ orderId }),
// ou livrer un fichier dans un projet custom ({ fileId, projectId }).
export async function POST(req: NextRequest) {
  const { ctx, error } = allowed(req);
  if (error) return error;
  const body = await req.json();
  const now = new Date().toISOString();

  if (body.orderId) {
    if (!can(ctx!.member.role, 'orders')) return NextResponse.json({ error: 'Accès refusé pour votre rôle.' }, { status: 403 });
    const requests = getRequests();
    const r = requests.find((x) => x.id === body.orderId && requestKind(x) === 'order');
    if (!r) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    if (orderInfo(r).paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'La commande doit être « Paid » pour donner accès aux fichiers.' }, { status: 409 });
    }
    const { granted, owner } = grantForOrder(r, ctx!.user.pseudo);
    if (!owner) return NextResponse.json({ error: 'Aucun compte client relié à cette commande.' }, { status: 409 });
    r.messages.push({ id: `msg_${Date.now()}_dl`, sender: 'admin', text: 'Your files are available in your account, under « My files ».', createdAt: now });
    r.status = 'answered';
    saveRequests(requests);
    audit(ctx!, 'file.resend_access', { target: r.id, detail: `${owner.pseudo} · ${granted} accès (ré)activé(s)` });
    return NextResponse.json({ success: true, granted });
  }

  const file = getFiles().find((f) => f.id === body.fileId && !f.deletedAt);
  if (!file) return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });

  if (body.projectId) {
    if (!can(ctx!.member.role, 'projects')) return NextResponse.json({ error: 'Accès refusé pour votre rôle.' }, { status: 403 });
    const requests = getRequests();
    const r = requests.find((x) => x.id === body.projectId && requestKind(x) === 'project');
    if (!r) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
    const owner = ownerOf(r);
    if (!owner) return NextResponse.json({ error: 'Aucun compte client relié à ce projet.' }, { status: 409 });
    const grants = getGrants();
    grantAccess(grants, file.id, owner.id, 'project', r.id, ctx!.user.pseudo);
    saveGrants(grants);
    const p = r.project || { stage: 'brief', previews: [], finalFiles: [] };
    r.project = { ...p, finalFiles: [...(p.finalFiles || []), { label: file.name, url: '/account?tab=files', at: now }], stage: 'delivered', updatedAt: now };
    r.messages.push({ id: `msg_${Date.now()}_ff`, sender: 'admin', text: `Your final files are ready: « ${file.name} ». Download them from your account, under « My files ».`, createdAt: now });
    r.status = 'answered';
    saveRequests(requests);
    audit(ctx!, 'file.deliver', { target: r.id, detail: `${file.name} → ${owner.pseudo}` });
    return NextResponse.json({ success: true });
  }

  if (!can(ctx!.member.role, 'customers')) return NextResponse.json({ error: 'Accès refusé pour votre rôle.' }, { status: 403 });
  const user = getUserById(String(body.userId || ''));
  if (!user) return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
  const grants = getGrants();
  const changed = grantAccess(grants, file.id, user.id, 'manual', undefined, ctx!.user.pseudo);
  saveGrants(grants);
  if (changed) audit(ctx!, 'file.grant', { target: file.name, detail: `→ ${user.pseudo}` });
  return NextResponse.json({ success: true, changed });
}

// Révoquer ou restaurer un accès.
export async function PATCH(req: NextRequest) {
  const { ctx, error } = allowed(req);
  if (error) return error;
  const { id, revoke } = await req.json();
  const grants = getGrants();
  const g = grants.find((x) => x.id === id);
  if (!g) return NextResponse.json({ error: 'Accès introuvable' }, { status: 404 });
  const file = getFiles().find((f) => f.id === g.fileId);
  const user = getUserById(g.userId);
  if (revoke) {
    g.revokedAt = new Date().toISOString();
    g.revokedBy = ctx!.user.pseudo;
  } else {
    g.revokedAt = undefined;
    g.revokedBy = undefined;
  }
  saveGrants(grants);
  audit(ctx!, revoke ? 'file.revoke' : 'file.restore_access', { target: file?.name || g.fileId, detail: user?.pseudo });
  return NextResponse.json({ success: true, grant: g });
}
