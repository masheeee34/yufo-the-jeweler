import { NextRequest, NextResponse } from 'next/server';
import { audit, requireAdmin } from '@/lib/team';
import { getRequests, saveRequests, OrderStatus, PaymentStatus } from '@/lib/requestsDb';
import { orderInfo, projectInfo, requestKind } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'delivered', 'cancelled'];
const PAYMENT_STATUSES: PaymentStatus[] = ['unpaid', 'partial', 'paid', 'refunded'];

// Liste commune : commandes premade + projets custom (dès qu'ils ont un prix ou un statut de paiement).
export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'orders');
  if (ctx instanceof NextResponse) return ctx;

  const rows = getRequests()
    .filter((r) => requestKind(r) === 'order' || (requestKind(r) === 'project' && (r.project?.price || r.project?.paymentStatus)))
    .map((r) => {
      if (requestKind(r) === 'order') {
        const o = orderInfo(r);
        return {
          id: r.id,
          kind: 'premade' as const,
          customer: r.pseudo,
          discordId: r.discordId,
          email: o.email,
          amount: o.total,
          amountPaid: o.amountPaid,
          items: o.items,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          status: o.status,
          createdAt: r.createdAt,
          notes: r.internalNotes || [],
        };
      }
      const p = projectInfo(r);
      return {
        id: r.id,
        kind: 'custom' as const,
        customer: r.pseudo,
        discordId: r.discordId,
        amount: p.price || 0,
        amountPaid: p.amountPaid,
        items: [{ name: p.piece || 'Custom piece', price: p.price || 0, quantity: 1 }],
        paymentStatus: p.paymentStatus || 'unpaid',
        status: p.stage,
        createdAt: r.createdAt,
        notes: r.internalNotes || [],
      };
    });
  return NextResponse.json({ orders: rows });
}

// Changer le statut de commande ou de paiement d'une commande premade.
// (Les projets custom se gèrent depuis Custom projects.)
export async function PATCH(req: NextRequest) {
  const ctx = requireAdmin(req, 'orders');
  if (ctx instanceof NextResponse) return ctx;
  const { id, status, paymentStatus, amountPaid } = await req.json();

  const requests = getRequests();
  const r = requests.find((x) => x.id === id && requestKind(x) === 'order');
  if (!r) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

  const before = orderInfo(r);
  const next = { ...before };
  if (status !== undefined) {
    if (!ORDER_STATUSES.includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    next.status = status;
  }
  if (paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(paymentStatus)) return NextResponse.json({ error: 'Statut de paiement invalide' }, { status: 400 });
    next.paymentStatus = paymentStatus;
  }
  if (amountPaid !== undefined) {
    const n = Number(amountPaid);
    if (!(n >= 0)) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    next.amountPaid = n;
  }
  next.updatedAt = new Date().toISOString();
  r.order = next;
  saveRequests(requests);

  audit(ctx, 'order.update', {
    target: r.id,
    before: { status: before.status, paymentStatus: before.paymentStatus, amountPaid: before.amountPaid },
    after: { status: next.status, paymentStatus: next.paymentStatus, amountPaid: next.amountPaid },
  });
  return NextResponse.json({ success: true, order: next });
}
