import { ClientRequest, getRequests } from './requestsDb';
import { awaitingReply, orderInfo, projectInfo, requestKind } from './commerce';
import { getReviews } from './reviewsDb';
import { getUsers } from './usersDb';
import { getInvitations } from './team';

// Événements affichés dans Notifications (calculés à partir des données, rien à stocker en double).
export interface AdminEvent {
  id: string;
  at: string;
  type: 'order' | 'payment' | 'project' | 'message' | 'review' | 'customer' | 'team';
  title: string;
  detail?: string;
  href: string;
  needsAction: boolean;
}

const lastMessageAt = (r: ClientRequest) => r.messages[r.messages.length - 1]?.createdAt || r.createdAt;

export function buildEvents(): AdminEvent[] {
  const events: AdminEvent[] = [];
  const requests = getRequests();

  for (const r of requests) {
    const kind = requestKind(r);
    if (kind === 'order') {
      const o = orderInfo(r);
      events.push({
        id: `order-${r.id}`,
        at: r.createdAt,
        type: 'order',
        title: `New order ${r.id} · $${o.total}`,
        detail: `${r.pseudo} · ${o.items.map((i) => i.name).join(', ')}`,
        href: `/admin/orders?id=${r.id}`,
        needsAction: o.paymentStatus === 'unpaid' || o.status === 'pending',
      });
    }
    if (kind === 'project') {
      const p = projectInfo(r);
      events.push({
        id: `project-${r.id}`,
        at: r.createdAt,
        type: 'project',
        title: `Custom request from ${r.pseudo}`,
        detail: [p.piece, p.budget, p.duration].filter(Boolean).join(' · '),
        href: `/admin/projects?id=${r.id}`,
        needsAction: p.stage === 'brief',
      });
      if (p.approvedAt) {
        events.push({ id: `approved-${r.id}`, at: p.approvedAt, type: 'project', title: `${r.pseudo} approved the 3D preview`, href: `/admin/projects?id=${r.id}`, needsAction: p.stage === 'approved' });
      }
    }
    if (awaitingReply(r) && r.messages.length > 1) {
      events.push({
        id: `msg-${r.id}-${r.messages.length}`,
        at: lastMessageAt(r),
        type: 'message',
        title: `New message from ${r.pseudo}`,
        detail: r.messages[r.messages.length - 1].text.slice(0, 120),
        href: kind === 'project' ? `/admin/projects?id=${r.id}` : `/admin/messages?id=${r.id}`,
        needsAction: true,
      });
    } else if (kind === 'ticket' && awaitingReply(r)) {
      events.push({ id: `ticket-${r.id}`, at: r.createdAt, type: 'message', title: `New ticket from ${r.pseudo}`, detail: r.subject, href: `/admin/messages?id=${r.id}`, needsAction: true });
    }
  }

  for (const rev of getReviews()) {
    if (rev.deletedAt) continue;
    events.push({ id: `review-${rev.id}`, at: rev.createdAt, type: 'review', title: `New review by ${rev.pseudo} (${rev.rating}★)`, detail: rev.message.slice(0, 120), href: `/admin/reviews`, needsAction: false });
  }

  for (const u of getUsers()) {
    events.push({ id: `customer-${u.id}`, at: u.createdAt, type: 'customer', title: `New customer: ${u.pseudo}`, href: `/admin/customers?id=${u.id}`, needsAction: false });
  }

  for (const inv of getInvitations()) {
    if (inv.usedBy && inv.usedAt) {
      events.push({ id: `inv-${inv.code}`, at: inv.usedAt, type: 'team', title: `${inv.usedBy} joined the team (${inv.role})`, href: `/admin/team/members`, needsAction: false });
    }
  }

  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 200);
}

// Compteurs des pastilles de la barre latérale.
export function sidebarCounts(seenAt?: string) {
  const requests = getRequests();
  const events = buildEvents();
  return {
    orders: requests.filter((r) => requestKind(r) === 'order' && orderInfo(r).status === 'pending').length,
    projects: requests.filter((r) => requestKind(r) === 'project' && projectInfo(r).stage === 'brief').length,
    messages: requests.filter((r) => awaitingReply(r)).length,
    // Première visite : seulement ce qui est à traiter ; ensuite, tout ce qui est arrivé depuis la dernière lecture.
    notifications: events.filter((e) => (seenAt ? e.at > seenAt : e.needsAction)).length,
  };
}
