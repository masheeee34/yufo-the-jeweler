import { NextRequest, NextResponse } from 'next/server';
import { saveRequests, TicketRole } from '@/lib/requestsDb';
import { getViewer, isPriority, loadTicket, logEvent, notifyMembers, PERM_KEYS, serializeTicket, statusOf, touch } from '@/lib/tickets';
import { audit, getTeam } from '@/lib/team';
import { getUserById, getUserByUsername } from '@/lib/usersDb';
import { notifyCustomer } from '@/lib/customersDb';
import { getSettings } from '@/lib/settings';
import { PERMISSION_LABELS, PRIORITIES } from '@/lib/ticketDefaults';
import { purgeRequest } from '@/lib/purge';

const ROLES: TicketRole[] = ['client', 'member', 'staff'];
const ROLE_LABEL: Record<TicketRole, string> = { client: 'Client', member: 'Member', staff: 'Staff' };

// Toutes les actions du bouton « Manage ». Chacune est vérifiée ici selon le rôle de l'équipe :
// appeler l'API à la main sans les droits ne sert à rien.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loaded = loadTicket(id);
  const v = loaded ? getViewer(req, loaded.r) : null;
  if (!loaded || !v) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  if (!v.canManage || !v.admin) return NextResponse.json({ error: 'Only the YUFO team can manage tickets.' }, { status: 403 });

  const { requests, r } = loaded;
  const t = r.ticket!;
  const ctx = v.admin;
  const by = v.user.pseudo;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');
  const isTeamUser = (userId: string) => {
    const u = getUserById(userId);
    return !!u?.discordId && getTeam().some((m) => m.discordId === u.discordId);
  };
  const findMember = () => t.members.find((m) => m.userId === String(body.userId || ''));
  const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
  const statuses = getSettings().tickets.statuses;
  const setStatusIfExists = (sid: string) => {
    if (statuses.some((s) => s.id === sid)) t.statusId = sid;
  };

  switch (action) {
    case 'add_member': {
      const u = getUserByUsername(String(body.username || ''));
      if (!u) return fail('No account found with this @username.', 404);
      const role: TicketRole = ROLES.includes(body.role) ? body.role : 'member';
      if (role === 'staff' && !isTeamUser(u.id)) return fail('Only members of the YUFO team can have the Staff role.');
      const existing = t.members.find((m) => m.userId === u.id);
      if (existing && !existing.revoked) return fail(`@${u.username} is already in this ticket.`);
      if (existing) {
        Object.assign(existing, { revoked: false, role, addedAt: new Date().toISOString(), addedBy: by, notify: true });
      } else {
        t.members.push({ userId: u.id, role, addedAt: new Date().toISOString(), addedBy: by, notify: true });
      }
      logEvent(r, by, `Added @${u.username} as ${ROLE_LABEL[role]}`);
      notifyCustomer(u.id, { type: 'ticket', title: 'You were added to a ticket', text: t.title, href: `/tickets/${r.id}` });
      audit(ctx, 'ticket.member.add', { target: r.id, detail: `@${u.username} (${role})` });
      break;
    }
    case 'remove_member': {
      const m = findMember();
      if (!m) return fail('Member not found.', 404);
      const u = getUserById(m.userId);
      t.members = t.members.filter((x) => x !== m);
      logEvent(r, by, `Removed ${u?.username ? `@${u.username}` : 'a member'}`);
      notifyCustomer(m.userId, { type: 'ticket', title: 'You were removed from a ticket', text: t.title });
      audit(ctx, 'ticket.member.remove', { target: r.id, detail: u?.username });
      break;
    }
    case 'revoke_access':
    case 'restore_access': {
      const m = findMember();
      if (!m) return fail('Member not found.', 404);
      const u = getUserById(m.userId);
      m.revoked = action === 'revoke_access';
      logEvent(r, by, `${m.revoked ? 'Revoked access of' : 'Gave access back to'} ${u?.username ? `@${u.username}` : 'a member'}`);
      notifyCustomer(m.userId, m.revoked
        ? { type: 'ticket', title: 'Your access to a ticket was removed', text: t.title }
        : { type: 'ticket', title: 'You have access to a ticket again', text: t.title, href: `/tickets/${r.id}` });
      audit(ctx, `ticket.member.${m.revoked ? 'revoke' : 'restore'}`, { target: r.id, detail: u?.username });
      break;
    }
    case 'mute':
    case 'unmute': {
      const m = findMember();
      if (!m) return fail('Member not found.', 404);
      m.muted = action === 'mute';
      const u = getUserById(m.userId);
      logEvent(r, by, `${m.muted ? 'Muted' : 'Unmuted'} ${u?.username ? `@${u.username}` : 'a member'}`);
      break;
    }
    case 'set_role': {
      const m = findMember();
      if (!m) return fail('Member not found.', 404);
      const role: TicketRole = body.role;
      if (!ROLES.includes(role)) return fail('Unknown role.');
      if (role === 'staff' && !isTeamUser(m.userId)) return fail('Only members of the YUFO team can have the Staff role.');
      m.role = role;
      const u = getUserById(m.userId);
      logEvent(r, by, `Changed the role of ${u?.username ? `@${u.username}` : 'a member'} to ${ROLE_LABEL[role]}`);
      break;
    }
    case 'set_notify': {
      const m = findMember();
      if (!m) return fail('Member not found.', 404);
      m.notify = !!body.notify;
      break;
    }
    case 'set_perm': {
      const key = body.key;
      if (!PERM_KEYS.includes(key)) return fail('Unknown permission.');
      t.perms[key as keyof typeof t.perms] = !!body.value;
      logEvent(r, by, `${PERMISSION_LABELS[key as keyof typeof PERMISSION_LABELS]}: ${body.value ? 'ON' : 'OFF'}`);
      break;
    }
    case 'lock':
    case 'unlock':
      t.locked = action === 'lock';
      logEvent(r, by, t.locked ? 'Locked the ticket' : 'Unlocked the ticket');
      notifyMembers(r, v.user.id, t.locked ? 'Ticket locked' : 'Ticket unlocked', t.title);
      break;
    case 'pause':
    case 'resume':
      t.paused = action === 'pause';
      setStatusIfExists(t.paused ? 'paused' : 'in_progress');
      logEvent(r, by, t.paused ? 'Paused the ticket' : 'Resumed the ticket');
      notifyMembers(r, v.user.id, t.paused ? 'Project paused' : 'Project resumed', t.title);
      break;
    case 'close':
    case 'reopen':
      t.closed = action === 'close';
      if (t.closed) {
        t.paused = false;
        setStatusIfExists('completed');
      } else setStatusIfExists('in_progress');
      logEvent(r, by, t.closed ? 'Closed the ticket' : 'Reopened the ticket');
      notifyMembers(r, v.user.id, t.closed ? 'Ticket closed' : 'Ticket reopened', t.title);
      audit(ctx, `ticket.${action}`, { target: r.id });
      break;
    case 'archive':
    case 'unarchive':
      t.archived = action === 'archive';
      logEvent(r, by, t.archived ? 'Archived the ticket' : 'Moved the ticket back to active tickets');
      break;
    case 'rename': {
      const title = String(body.title ?? '').trim().slice(0, 80);
      if (!title) return fail('The title cannot be empty.');
      logEvent(r, by, `Renamed the ticket to “${title}”`);
      t.title = title;
      break;
    }
    case 'set_status': {
      const s = statuses.find((x) => x.id === body.statusId);
      if (!s) return fail('Unknown status.');
      if (s.id === t.statusId) break;
      t.statusId = s.id;
      logEvent(r, by, `Status: ${s.label}`);
      if (s.important) notifyMembers(r, v.user.id, `Status updated · ${s.label}`, t.title);
      break;
    }
    case 'set_priority': {
      if (!isPriority(body.priority)) return fail('Unknown priority.');
      t.priority = body.priority;
      logEvent(r, by, `Priority: ${PRIORITIES.find((p) => p.id === body.priority)?.label}`);
      break;
    }
    case 'delete': {
      if (!v.canDelete) return fail('Only Founders and Admins can delete a ticket.', 403);
      purgeRequest(r.id);
      audit(ctx, 'ticket.delete', { detail: `${r.id} · ${t.title}` });
      return NextResponse.json({ success: true, deleted: true });
    }
    default:
      return fail('Unknown action.');
  }

  touch(r);
  saveRequests(requests);
  return NextResponse.json({ success: true, ticket: serializeTicket(r, v), status: statusOf(t) });
}
