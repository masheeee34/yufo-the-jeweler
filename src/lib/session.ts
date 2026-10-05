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
  remember?: boolean; // « Rester connecté » : session longue et prolongée à chaque visite
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

// Sans « Rester connecté », la session dure tant que le navigateur reste ouvert (12 h d'inactivité au plus).
const SHORT_MS = 12 * 3600000;
const lifetimeMs = (remember?: boolean) => (remember === false ? SHORT_MS : sessionDays() * 86400000);

export function createSession(req: NextRequest, res: NextResponse, userId: string, remember = true) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const record: SessionRecord = {
    id: hash(token),
    userId,
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + lifetimeMs(remember)).toISOString(),
    ip: clientIp(req),
    userAgent: (req.headers.get('user-agent') || '').slice(0, 200),
    remember,
  };
  saveSessions([...getSessions(), record]);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isHttps(req),
    sameSite: 'lax',
    path: '/',
    ...(remember ? { maxAge: sessionDays() * 86400 } : {}),
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
  // Mise à jour de « vu pour la dernière fois » au plus toutes les 5 minutes ; la session est prolongée
  // à chaque visite, pour ne pas avoir à remettre son mot de passe tant qu'on revient régulièrement.
  if (Date.now() - new Date(found.lastSeenAt).getTime() > 5 * 60000) {
    found.lastSeenAt = new Date().toISOString();
    found.ip = clientIp(req) || found.ip;
    found.expiresAt = new Date(Date.now() + lifetimeMs(found.remember)).toISOString();
    saveSessions(list);
  }
  return found;
}

export function getSessionUser(req: NextRequest): UserProfile | null {
  const s = getSessionRecord(req);
  return s ? getUserById(s.userId) : null;
}

// Prolonge aussi le cookie (appelé par /api/auth/me à chaque visite) pour une session « Rester connecté ».
export function refreshSessionCookie(req: NextRequest, res: NextResponse) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const s = getSessionRecord(req);
  if (!token || !s || s.remember === false) return;
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: isHttps(req), sameSite: 'lax', path: '/', maxAge: sessionDays() * 86400 });
}

export function destroySession(req: NextRequest, res: NextResponse) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) saveSessions(getSessions().filter((s) => s.id !== hash(token)));
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(LEGACY_COOKIE);
}

// Identifiant public d'une session (pour la liste des appareils), dérivé de son empreinte.
export const sessionPublicId = (s: SessionRecord) => s.id.slice(0, 16);

export function getUserSessions(userId: string): SessionRecord[] {
  return getSessions().filter((s) => s.userId === userId);
}

export function revokeSessions(predicate: (s: SessionRecord) => boolean): number {
  const list = getSessions();
  const kept = list.filter((s) => !predicate(s));
  saveSessions(kept);
  return list.length - kept.length;
}
