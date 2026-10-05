import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { audit, getAudit, requireAdmin } from '@/lib/team';
import { writeJson } from '@/lib/jsonStore';
import { ChatMessage, getRequests, saveRequests, PaymentStatus, ProjectData, ProjectStage } from '@/lib/requestsDb';
import { projectInfo, requestKind } from '@/lib/commerce';
import { MAX_ATTACHMENTS, UPLOADS_DIR, uploadExists, uploadReferenced } from '@/lib/uploads';
import { getGrants, ownerOf, saveGrants } from '@/lib/filesDb';
import { getCustomerRecords, notifyCustomer, saveCustomerRecord } from '@/lib/customersDb';
import { purgeRequest } from '@/lib/purge';

export const dynamic = 'force-dynamic';

const STAGES: ProjectStage[] = ['brief', 'quoted', 'in_progress', 'preview', 'approved', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'partial', 'paid', 'refunded'];

const msgId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'projects');
  if (ctx instanceof NextResponse) return ctx;
  const projects = getRequests()
    .filter((r) => requestKind(r) === 'project')
    .map((r) => {
      const p = projectInfo(r);
      // Demandes de changement : messages du client envoyés après la première preview.
      const firstPreview = p.previews[0]?.at;
      const changeRequests = firstPreview ? r.messages.filter((m) => m.sender === 'client' && m.createdAt > firstPreview) : [];
      return {
        id: r.id,
        customer: r.pseudo,
        discordId: r.discordId,
        createdAt: r.createdAt,
        status: r.status,
        project: p,
        references: r.messages[0]?.attachments || [],
        messages: r.messages,
        changeRequests,
        notes: r.internalNotes || [],
      };
    });
  return NextResponse.json({ projects });
}

// Mise à jour des champs du projet (statut, devis, paiement, options).
export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'projects');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();
  const requests = getRequests();
  const r = requests.find((x) => x.id === body.id && requestKind(x) === 'project');
  if (!r) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

  const current = projectInfo(r);
  const before: ProjectData = { stage: current.stage, price: current.price, paymentStatus: current.paymentStatus, amountPaid: current.amountPaid, priority: current.priority, strictOptimization: current.strictOptimization, previews: current.previews, finalFiles: current.finalFiles, approvedAt: current.approvedAt };
  const next: ProjectData = { ...before };

  if (body.stage !== undefined) {
    if (!STAGES.includes(body.stage)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    next.stage = body.stage;
  }
  if (body.price !== undefined) {
    const n = body.price === null || body.price === '' ? undefined : Number(body.price);
    if (n !== undefined && !(n >= 0)) return NextResponse.json({ error: 'Prix invalide' }, { status: 400 });
    next.price = n;
    if (n !== undefined && next.stage === 'brief') next.stage = 'quoted';
  }
  if (body.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) return NextResponse.json({ error: 'Statut de paiement invalide' }, { status: 400 });
    next.paymentStatus = body.paymentStatus;
  }
  if (body.amountPaid !== undefined) {
    const n = Number(body.amountPaid);
    if (!(n >= 0)) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    next.amountPaid = n;
  }
  if (body.priority !== undefined) next.priority = !!body.priority;
  if (body.strictOptimization !== undefined) next.strictOptimization = !!body.strictOptimization;
  next.updatedAt = new Date().toISOString();

  r.project = next;
  saveRequests(requests);
  if (next.stage !== before.stage) {
    const owner = ownerOf(r);
    const labels: Record<string, string> = { quoted: 'Your quote is ready', in_progress: 'Your piece is in the workshop', preview: 'A 3D preview is ready', approved: 'Preview approved', delivered: 'Your piece is delivered', cancelled: 'Project cancelled' };
    if (owner && labels[next.stage]) notifyCustomer(owner.id, { type: 'project', title: labels[next.stage], text: `Custom project ${r.id}`, href: '/account?tab=commissions' });
  }
  const pick = (p: ProjectData) => ({ stage: p.stage, price: p.price, paymentStatus: p.paymentStatus, amountPaid: p.amountPaid, priority: p.priority, strictOptimization: p.strictOptimization });
  audit(ctx, 'project.update', { target: r.id, before: pick(before), after: pick(next) });
  return NextResponse.json({ success: true, project: next });
}

// Actions : envoyer des previews, livrer les fichiers finaux, répondre au client.
export async function POST(req: NextRequest) {
  const ctx = requireAdmin(req, 'projects');
  if (ctx instanceof NextResponse) return ctx;
  const body = await req.json();
  const requests = getRequests();
  const r = requests.find((x) => x.id === body.id && requestKind(x) === 'project');
  if (!r) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

  const now = new Date().toISOString();
  const p = projectInfo(r);
  const project: ProjectData = { stage: p.stage, price: p.price, paymentStatus: p.paymentStatus, amountPaid: p.amountPaid, priority: p.priority, strictOptimization: p.strictOptimization, previews: p.previews, finalFiles: p.finalFiles, approvedAt: p.approvedAt };
  const text = String(body.text || '').trim().slice(0, 4000);
  const files: string[] = Array.isArray(body.files) ? body.files.map(String).filter(uploadExists).slice(0, MAX_ATTACHMENTS) : [];
  let message: ChatMessage | null = null;

  if (body.action === 'preview') {
    if (!files.length) return NextResponse.json({ error: 'Ajoutez au moins une image de preview.' }, { status: 400 });
    project.previews = [...project.previews, ...files.map((file) => ({ file, at: now, by: ctx.user.pseudo }))];
    project.stage = 'preview';
    project.approvedAt = undefined;
    message = { id: msgId(), sender: 'admin', text: text || 'New 3D preview ready. Reply here with any changes, or approve it from your account.', createdAt: now, attachments: files };
    audit(ctx, 'project.preview', { target: r.id, detail: `${files.length} preview(s)` });
  } else if (body.action === 'final') {
    const url = String(body.url || '').trim();
    const label = String(body.label || 'Final files').trim().slice(0, 80);
    if (!/^https?:\/\/\S+$/i.test(url)) return NextResponse.json({ error: 'Lien invalide (http ou https).' }, { status: 400 });
    project.finalFiles = [...project.finalFiles, { label, url, at: now }];
    project.stage = 'delivered';
    message = { id: msgId(), sender: 'admin', text: `${text || 'Your final files are ready.'}\n\n${label}: ${url}`, createdAt: now };
    audit(ctx, 'project.final_files', { target: r.id, detail: label, after: { url } });
  } else if (body.action === 'reply') {
    if (!text && !files.length) return NextResponse.json({ error: 'Message vide.' }, { status: 400 });
    message = { id: msgId(), sender: 'admin', text, createdAt: now, ...(files.length ? { attachments: files } : {}) };
  } else {
    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
  }

  project.updatedAt = now;
  r.project = project;
  const owner = ownerOf(r);
  if (owner && body.action === 'preview') notifyCustomer(owner.id, { type: 'project', title: 'A 3D preview is ready', text: `Check it and approve it, or ask for changes (${r.id}).`, href: '/account?tab=commissions' });
  if (owner && body.action === 'final') notifyCustomer(owner.id, { type: 'files', title: 'Your files are ready', text: `Custom project ${r.id} is delivered.`, href: '/account?tab=commissions' });
  if (message) {
    r.messages.push(message);
    r.status = 'answered';
  }
  saveRequests(requests);
  return NextResponse.json({ success: true, project, message });
}

// Suppression définitive d'un projet sur mesure (Founder et Admin) : la demande, sa conversation,
// ses images (références et previews), les accès aux fichiers livrés, les notifications du client
// et les lignes du journal qui le concernent. Seule reste une ligne « supprimé définitivement ».
export async function DELETE(req: NextRequest) {
  const ctx = requireAdmin(req, 'projects');
  if (ctx instanceof NextResponse) return ctx;
  if (ctx.member.role !== 'founder' && ctx.member.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux Founders et Admins.' }, { status: 403 });
  }
  const id = req.nextUrl.searchParams.get('id') || '';
  const requests = getRequests();
  const r = requests.find((x) => x.id === id && requestKind(x) === 'project');
  if (!r) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });

  const result = purgeRequest(id)!;

  audit(ctx, 'project.purge', { target: id, detail: 'Projet supprimé définitivement' });
  return NextResponse.json({ success: true, ...result });
}
