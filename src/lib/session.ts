import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from './jsonStore';
import { getUserById, UserProfile } from './usersDb';

// Sessions serveur : le cookie contient un jeton aléatoire, seul son empreinte SHA-256 est stockée.
// (Avant, le cookie contenait l'identifiant de l'utilisateur et pouvait être fabriqué.)
export const SESSION_COOKIE = 'yufo_session';
const LEGACY_COOKIE = 'yufo_auth_token';
const FILE = 'sessions.json';

export interface SessionRecord {
  id: string; // sha256 du jeton
  userId: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  ip?: string;
  userAgent?: string;
}

const hash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export function getSessions(): SessionRecord[] {
  const now = Date.now();
  return readJson<SessionRecord[]>(FILE, []).filter((s) => new Date(s.expiresAt).getTime() > now);
}

function saveSessions(list: SessionRecord[]) {
  writeJson(FILE, list);
}

function clientIp(req: NextRequest) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || undefined;
}

function isHttps(req: NextRequest) {
  return req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';
}

// Durée de session en jours (réglable dans Settings > Security).
function sessionDays(): number {
  const s = readJson<{ security?: { sessionDays?: number } }>('settings.json', {});
  const d = Number(s.security?.sessionDays);
  return d >= 1 && d <= 90 ? d : 30;
}

export function createSession(req: NextRequest, res: NextResponse, userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const days = sessionDays();
  const record: SessionRecord = {
    id: hash(token),
    userId,
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + days * 86400000).toISOString(),
    ip: clientIp(req),
    userAgent: (req.headers.get('user-agent') || '').slice(0, 200),
  };
  saveSessions([...getSessions(), record]);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps(req),
    sameSite: 'lax',
    path: '/',
    maxAge: days * 86400,
  });
  res.cookies.delete(LEGACY_COOKIE);
}

export function getSessionRecord(req: NextRequest): SessionRecord | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token || token.length !== 64) return null;
  const id = hash(token);
  const list = getSessions();
  const found = list.find((s) => s.id === id);
  if (!found) return null;
  // Mise à jour de « vu pour la dernière fois » au plus toutes les 5 minutes.
  if (Date.now() - new Date(found.lastSeenAt).getTime() > 5 * 60000) {
    found.lastSeenAt = new Date().toISOString();
    found.ip = clientIp(req) || found.ip;
    saveSessions(list);
  }
  return found;
}

export function getSessionUser(req: NextRequest): UserProfile | null {
  const s = getSessionRecord(req);
  return s ? getUserById(s.userId) : null;
}

export function destroySession(req: NextRequest, res: NextResponse) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) saveSessions(getSessions().filter((s) => s.id !== hash(token)));
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(LEGACY_COOKIE);
}

export function revokeSessions(predicate: (s: SessionRecord) => boolean): number {
  const list = getSessions();
  const kept = list.filter((s) => !predicate(s));
  saveSessions(kept);
  return list.length - kept.length;
}
