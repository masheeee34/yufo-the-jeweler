import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/team';
import { getRequests } from '@/lib/requestsDb';
import { awaitingReply, isPaid, orderInfo, projectInfo, requestKind } from '@/lib/commerce';

export const dynamic = 'force-dynamic';

// Données du Dashboard : commandes récentes, projets actifs, messages non lus, paiements récents.
export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'dashboard');
  if (ctx instanceof NextResponse) return ctx;

  const requests = getRequests();
  const orders = requests.filter((r) => requestKind(r) === 'order');
  const projects = requests.filter((r) => requestKind(r) === 'project');
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const payments = [
    ...orders.map((r) => {
      const o = orderInfo(r);
      return { id: r.id, customer: r.pseudo, amount: o.amountPaid ?? o.total, paymentStatus: o.paymentStatus, at: o.updatedAt || r.createdAt, kind: 'premade' as const };
    }),
    ...projects
      .map((r) => ({ r, p: projectInfo(r) }))
      .filter(({ p }) => p.paymentStatus && p.paymentStatus !== 'unpaid')
      .map(({ r, p }) => ({ id: r.id, customer: r.pseudo, amount: p.amountPaid ?? p.price ?? 0, paymentStatus: p.paymentStatus!, at: p.updatedAt || r.createdAt, kind: 'custom' as const })),
  ]
    .filter((p) => isPaid(p.paymentStatus) || p.paymentStatus === 'refunded')
    .sort((a, b) => b.at.localeCompare(a.at));

  const revenueMonth = payments.filter((p) => isPaid(p.paymentStatus) && p.at >= monthStart).reduce((s, p) => s + p.amount, 0);

  return NextResponse.json({
    stats: {
      revenueMonth,
      ordersMonth: orders.filter((r) => r.createdAt >= monthStart).length,
      activeProjects: projects.filter((r) => !['delivered', 'cancelled'].includes(projectInfo(r).stage)).length,
      unreadMessages: requests.filter(awaitingReply).length,
    },
    recentOrders: orders.slice(0, 6).map((r) => {
      const o = orderInfo(r);
      return { id: r.id, customer: r.pseudo, total: o.total, items: o.items.map((i) => i.name).join(', '), paymentStatus: o.paymentStatus, status: o.status, at: r.createdAt };
    }),
    activeProjects: projects
      .map((r) => ({ r, p: projectInfo(r) }))
      .filter(({ p }) => !['delivered', 'cancelled'].includes(p.stage))
      .slice(0, 6)
      .map(({ r, p }) => ({ id: r.id, customer: r.pseudo, piece: p.piece, stage: p.stage, priority: !!p.priority, budget: p.budget, at: r.createdAt })),
    unreadMessages: requests
      .filter(awaitingReply)
      .slice(0, 6)
      .map((r) => ({ id: r.id, customer: r.pseudo, kind: requestKind(r), text: r.messages[r.messages.length - 1]?.text.slice(0, 140), at: r.messages[r.messages.length - 1]?.createdAt || r.createdAt })),
    recentPayments: payments.slice(0, 6),
  });
}
