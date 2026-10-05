import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { ChatMessage, ClientRequest, getRequests, saveRequests, TicketData, TicketMember, TicketRole } from './requestsDb';
import { projectInfo } from './commerce';
import { ownerOf } from './filesDb';
import { getSettings } from './settings';
import { getSessionUser } from './session';
import { AdminContext, can, getAdmin, getTeam } from './team';
import { getUserById, getUsers, UserProfile } from './usersDb';
import { notifyCustomer } from './customersDb';
import { PRIORITIES, TicketPermissions, TicketPriority } from './ticketDefaults';

// Tickets : l'espace privé de conversation et de suivi de chaque demande sur mesure.
// Toutes les règles d'accès sont vérifiées ici, côté serveur (masquer un bouton ne suffit jamais).

export const isTicketRequest = (r: ClientRequest) => !!r.ticket || r.id.startsWith('YUF-INQ');
const eventId = () => crypto.randomBytes(5).toString('hex');

function defaultTitle(r: ClientRequest): string {
  const piece = projectInfo(r).piece;
  return piece ? `Custom ${piece}`.slice(0, 80) : r.subject.replace(/^\[[^\]]+\]\s*/, '').slice(0, 80) || r.id;
}

export function newTicket(r: ClientRequest, owner: UserProfile | null, by = 'System'): TicketData {
  const s = getSettings().tickets;
  const now = new Date().toISOString();
  return {
    title: defaultTitle(r),
    statusId: s.statuses.some((x) => x.id === s.defaultStatus) ? s.defaultStatus : s.statuses[0]?.id || 'new',
    priority: 'normal',
    locked: false,
    paused: false,
    closed: false,
    archived: false,
    perms: { ...s.defaultPerms },
    members: owner ? [{ userId: owner.id, role: 'client', addedAt: r.createdAt, addedBy: by, notify: true }] : [],
    pinned: [],
    events: [{ id: eventId(), at: now, by, text: 'Ticket created' }],
    rev: 1,
    createdAt: r.createdAt,
    updatedAt: now,
  };
}

// Les demandes envoyées avant l'arrivée des tickets en reçoivent un à la première ouverture.
export function ensureTicket(r: ClientRequest): boolean {
  if (r.ticket || !isTicketRequest(r)) return false;
  const owner = ownerOf(r);
  if (owner && !r.userId) r.userId = owner.id;
  r.ticket = newTicket(r, owner);
  return true;
}

// ---------- Qui voit, qui gère ----------

export interface Viewer {
  user: UserProfile;
  admin: AdminContext | null;
  canManage: boolean; // membres de l'équipe autorisés (bouton Manage)
  canDelete: boolean; // suppression définitive : Founders et Admins
  member?: TicketMember;
}

export function getViewer(req: NextRequest, r: ClientRequest): Viewer | null {
  const user = getSessionUser(req);
  if (!user || !r.ticket) return null;
  const admin = getAdmin(req);
  const canManage = !!admin && (can(admin.member.role, 'projects') || can(admin.member.role, 'messages'));
  const member = r.ticket.members.find((m) => m.userId === user.id && !m.revoked);
  if (!canManage && !member) return null;
  const canDelete = canManage && (admin!.member.role === 'founder' || admin!.member.role === 'admin');
  return { user, admin: canManage ? admin : null, canManage, canDelete, member };
}

export function canSeeTicketList(req: NextRequest) {
  const admin = getAdmin(req);
  return !!admin && (can(admin.member.role, 'projects') || can(admin.member.role, 'messages'));
}

// Raison pour laquelle ce visiteur ne peut pas écrire (null = il peut).
export function postBlock(t: TicketData, v: Viewer): string | null {
  if (v.canManage) return null;
  const m = v.member;
  if (!m) return 'You are not a member of this ticket.';
  if (t.closed) return 'This ticket is closed.';
  if (t.locked) return 'Replies are locked for the moment.';
  if (!t.perms.replies) return 'Replies are turned off for this ticket.';
  if (m.muted) return 'You have been muted in this ticket.';
  if (m.role === 'member' && !t.perms.membersCanReply) return 'Only the client and the YUFO team can reply here.';
  return null;
}

export const canSendImages = (t: TicketData, v: Viewer) => v.canManage || t.perms.images;
export const canSendFiles = (t: TicketData, v: Viewer) => v.canManage || t.perms.files;
export const canDownload = (t: TicketData, v: Viewer) => v.canManage || t.perms.downloads;

// ---------- Lecture / écriture ----------

export function loadTicket(id: string): { requests: ClientRequest[]; r: ClientRequest } | null {
  const requests = getRequests();
  const r = requests.find((x) => x.id === id);
  if (!r || !isTicketRequest(r)) return null;
  if (ensureTicket(r)) saveRequests(requests);
  return { requests, r };
}

export function touch(r: ClientRequest) {
  r.ticket!.rev += 1;
  r.ticket!.updatedAt = new Date().toISOString();
}

export function logEvent(r: ClientRequest, by: string, text: string) {
  r.ticket!.events.unshift({ id: eventId(), at: new Date().toISOString(), by, text });
  r.ticket!.events = r.ticket!.events.slice(0, 200);
}

export function statusOf(t: TicketData) {
  const list = getSettings().tickets.statuses;
  return list.find((s) => s.id === t.statusId) || { id: t.statusId, label: t.statusId, tone: 'zinc' as const, important: false };
}

// ---------- Notifications ----------

export function notifyMembers(r: ClientRequest, exceptUserId: string | null, title: string, text: string, key?: string) {
  for (const m of r.ticket!.members) {
    if (m.revoked || m.notify === false || m.userId === exceptUserId) continue;
    notifyCustomer(m.userId, { type: 'ticket', title, text, href: `/tickets/${r.id}`, key });
  }
}

// ---------- Présentation ----------

const userCache = () => {
  const map = new Map(getUsers().map((u) => [u.id, u]));
  const team = new Set(getTeam().map((m) => m.discordId));
  return { map, team };
};

function publicUser(u: { id: string; pseudo: string; username?: string; avatarUrl?: string; avatar?: string; discordId?: string } | undefined) {
  if (!u) return { id: '', name: 'Former member', username: '', avatarUrl: '', discordId: '', avatar: '' };
  return { id: u.id, name: u.pseudo, username: u.username || '', avatarUrl: u.avatarUrl || '', discordId: u.discordId || '', avatar: u.avatar || '' };
}

export function serializeTicket(r: ClientRequest, v: Viewer) {
  const t = r.ticket!;
  const { map, team } = userCache();
  const staffView = v.canManage;
  const ownerId = t.members.find((m) => m.role === 'client')?.userId;
  const owner = ownerId ? map.get(ownerId) : undefined;

  const messages = r.messages
    .filter((m) => (staffView ? true : !m.hidden && !m.deletedAt))
    .map((m: ChatMessage) => {
      const authorUser = m.authorId ? map.get(m.authorId) : m.sender === 'client' ? owner : undefined;
      const isStaff = m.sender === 'admin';
      const author = authorUser
        ? publicUser(authorUser)
        : { ...publicUser(undefined), name: isStaff ? 'YUFO' : r.pseudo || 'Client' };
      const role: TicketRole = isStaff ? 'staff' : t.members.find((x) => x.userId === authorUser?.id)?.role || 'client';
      return {
        id: m.id,
        author,
        role,
        text: m.deletedAt ? '' : m.text,
        createdAt: m.createdAt,
        editedAt: m.editedAt,
        images: m.deletedAt ? [] : (m.attachments || []).map((a) => `/api/uploads/${a}`),
        files: m.deletedAt ? [] : (m.files || []).map((f) => ({ id: f.id, name: f.name, size: f.size })),
        hidden: !!m.hidden,
        deleted: !!m.deletedAt,
        pinned: t.pinned.includes(m.id),
        mine: !!m.authorId && m.authorId === v.user.id,
      };
    });

  const members = t.members
    .filter((m) => staffView || !m.revoked)
    .map((m) => {
      const u = map.get(m.userId);
      return {
        ...publicUser(u),
        userId: m.userId,
        role: m.role,
        isTeam: !!u?.discordId && team.has(u.discordId),
        muted: !!m.muted,
        ...(staffView ? { revoked: !!m.revoked, notify: m.notify !== false, addedBy: m.addedBy, addedAt: m.addedAt } : {}),
      };
    });

  const p = projectInfo(r);
  const settings = getSettings().tickets;
  const block = postBlock(t, v);
  return {
    id: r.id,
    rev: t.rev,
    title: t.title,
    status: statusOf(t),
    priority: t.priority,
    priorityLabel: PRIORITIES.find((x) => x.id === t.priority)?.label || t.priority,
    locked: t.locked,
    paused: t.paused,
    closed: t.closed,
    archived: t.archived,
    perms: t.perms,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    messages,
    members,
    project: {
      piece: p.piece,
      budget: p.budget,
      duration: p.duration,
      wornBy: p.wornBy,
      vision: p.vision,
      stage: p.stage,
      price: p.price,
      paymentStatus: p.paymentStatus,
      references: (r.messages[0]?.attachments || []).map((a) => `/api/uploads/${a}`),
      previews: p.previews.map((x) => ({ url: `/api/uploads/${x.file}`, at: x.at })),
      finalFiles: canDownload(t, v) ? p.finalFiles : [],
    },
    viewer: {
      userId: v.user.id,
      canManage: v.canManage,
      canDelete: v.canDelete,
      canPost: !block,
      postBlock: block,
      canImages: canSendImages(t, v),
      canFiles: canSendFiles(t, v),
      canDownload: canDownload(t, v),
    },
    ...(staffView
      ? {
          events: t.events.slice(0, 60),
          statuses: settings.statuses,
          internal: { pseudo: r.pseudo, stage: p.stage },
        }
      : {}),
    sound: settings.sound,
    soundVolume: settings.soundVolume,
    maxFileMb: settings.maxFileMb,
  };
}

// Résumé pour les listes de tickets.
export function ticketSummary(r: ClientRequest, viewerId: string) {
  const t = r.ticket!;
  const last = [...r.messages].reverse().find((m) => !m.deletedAt && !m.hidden);
  return {
    id: r.id,
    title: t.title,
    status: statusOf(t),
    priority: t.priority,
    locked: t.locked,
    paused: t.paused,
    closed: t.closed,
    archived: t.archived,
    updatedAt: t.updatedAt,
    createdAt: t.createdAt,
    client: r.pseudo,
    members: t.members.filter((m) => !m.revoked).length,
    lastMessage: last ? { text: last.text.slice(0, 140), at: last.createdAt, fromStaff: last.sender === 'admin' } : null,
    mine: t.members.some((m) => m.userId === viewerId && !m.revoked),
  };
}

export function getMemberUser(userId: string) {
  return getUserById(userId);
}

export type PermKey = keyof TicketPermissions;
export const PERM_KEYS: PermKey[] = ['replies', 'images', 'files', 'downloads', 'membersCanReply'];
export const isPriority = (p: unknown): p is TicketPriority => PRIORITIES.some((x) => x.id === p);
