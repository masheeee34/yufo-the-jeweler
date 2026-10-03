import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from './jsonStore';
import { getSessionRecord } from './session';
import { getUserById, UserProfile } from './usersDb';

// Équipe du back-office : comptes Discord autorisés et leur rôle.
// Permissions par rôle, volontairement simples (pas de permissions individuelles).
export type Role = 'founder' | 'admin' | 'jeweler' | 'support' | 'moderator';
export const ROLES: Role[] = ['founder', 'admin', 'jeweler', 'support', 'moderator'];
export const ROLE_LABELS: Record<Role, string> = {
  founder: 'Founder',
  admin: 'Admin',
  jeweler: 'Jeweler',
  support: 'Support',
  moderator: 'Moderator',
};

export type Permission =
  | 'dashboard'
  | 'orders'
  | 'projects'
  | 'messages'
  | 'store' // créations, catégories, collections
  | 'reviews'
  | 'customers'
  | 'team'
  | 'settings'
  | 'payments'
  | 'security'
  | 'logs';

const ALL: Permission[] = ['dashboard', 'orders', 'projects', 'messages', 'store', 'reviews', 'customers', 'team', 'settings', 'payments', 'security', 'logs'];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  founder: ALL,
  admin: ALL.filter((p) => p !== 'payments' && p !== 'security'),
  jeweler: ['dashboard', 'orders', 'projects', 'messages', 'store', 'customers'],
  support: ['dashboard', 'orders', 'messages', 'reviews', 'customers'],
  moderator: ['dashboard', 'messages', 'reviews'],
};

export const can = (role: Role, perm: Permission) => (ROLE_PERMISSIONS[role] || []).includes(perm);

// Qui peut gérer qui : un Founder gère tout le monde, un Admin gère les rôles en dessous de lui.
export function canManage(actor: Role, target: Role): boolean {
  if (actor === 'founder') return true;
  if (actor === 'admin') return target !== 'founder' && target !== 'admin';
  return false;
}

export interface TeamMember {
  discordId: string;
  role: Role;
  addedAt: string;
  addedBy?: string;
  notificationsSeenAt?: string;
}

// Premiers Founders, créés automatiquement si l'équipe est vide (Yufo et le développeur).
const BOOTSTRAP_FOUNDERS = ['235464191543214081', '282209931598364682'];

export function getTeam(): TeamMember[] {
  const team = readJson<TeamMember[] | null>('team.json', null);
  if (team && team.length) return team;
  const seeded = BOOTSTRAP_FOUNDERS.map((discordId) => ({ discordId, role: 'founder' as Role, addedAt: new Date().toISOString() }));
  writeJson('team.json', seeded);
  return seeded;
}

export function saveTeam(team: TeamMember[]) {
  writeJson('team.json', team);
}

export interface AdminContext {
  user: UserProfile;
  member: TeamMember;
  sessionId: string;
}

export function getAdmin(req: NextRequest): AdminContext | null {
  const session = getSessionRecord(req);
  if (!session) return null;
  const user = getUserById(session.userId);
  if (!user?.discordId) return null;
  const member = getTeam().find((m) => m.discordId === user.discordId);
  if (!member || !ROLES.includes(member.role)) return null;
  return { user, member, sessionId: session.id };
}

// À utiliser au début de chaque route admin : renvoie le contexte, ou une réponse 401/403 à retourner telle quelle.
export function requireAdmin(req: NextRequest, perm: Permission): AdminContext | NextResponse {
  const ctx = getAdmin(req);
  if (!ctx) return NextResponse.json({ error: 'Connexion administrateur requise.' }, { status: 401 });
  if (!can(ctx.member.role, perm)) return NextResponse.json({ error: 'Accès refusé pour votre rôle.' }, { status: 403 });
  return ctx;
}

// ---------- Invitations ----------

export interface Invitation {
  code: string;
  role: Role;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  usedBy?: string;
  usedAt?: string;
  revoked?: boolean;
}

export function getInvitations(): Invitation[] {
  return readJson<Invitation[]>('invitations.json', []);
}

export function saveInvitations(list: Invitation[]) {
  writeJson('invitations.json', list);
}

export function invitationState(inv: Invitation): 'pending' | 'used' | 'expired' | 'revoked' {
  if (inv.revoked) return 'revoked';
  if (inv.usedBy) return 'used';
  if (new Date(inv.expiresAt).getTime() < Date.now()) return 'expired';
  return 'pending';
}

export function createInvitation(role: Role, createdBy: string, days = 7): Invitation {
  const inv: Invitation = {
    code: crypto.randomBytes(12).toString('base64url'),
    role,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
    createdBy,
  };
  saveInvitations([inv, ...getInvitations()]);
  return inv;
}

// ---------- Journal d'activité (ajout seulement : aucune route ne permet de le modifier) ----------

export interface AuditEntry {
  id: string;
  at: string;
  by: string; // pseudo
  byDiscordId?: string;
  role?: Role;
  action: string; // ex. "product.update"
  target?: string; // ex. "Rolex Datejust 41"
  detail?: string;
  before?: unknown;
  after?: unknown;
}

export function audit(
  ctx: { user: UserProfile; member?: TeamMember },
  action: string,
  opts: { target?: string; detail?: string; before?: unknown; after?: unknown } = {}
) {
  const list = readJson<AuditEntry[]>('audit.json', []);
  list.unshift({
    id: crypto.randomBytes(6).toString('hex'),
    at: new Date().toISOString(),
    by: ctx.user.pseudo,
    byDiscordId: ctx.user.discordId,
    role: ctx.member?.role,
    action,
    ...opts,
  });
  writeJson('audit.json', list.slice(0, 5000));
}

export function getAudit(): AuditEntry[] {
  return readJson<AuditEntry[]>('audit.json', []);
}

// Ne garde que les champs qui ont changé, pour un journal lisible (avant / après).
export function diff<T extends Record<string, any>>(before: T, after: T): { before: Partial<T>; after: Partial<T> } | null {
  const b: Partial<T> = {};
  const a: Partial<T> = {};
  for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
      (b as any)[k] = before[k];
      (a as any)[k] = after[k];
    }
  }
  return Object.keys(a).length ? { before: b, after: a } : null;
}
