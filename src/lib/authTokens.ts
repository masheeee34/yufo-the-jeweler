import crypto from 'crypto';
import { readJson, writeJson } from './jsonStore';

// Jetons à usage unique envoyés par e-mail (vérification d'adresse, nouveau mot de passe).
// Seule l'empreinte SHA-256 est stockée ; le jeton lui-même ne vit que dans le lien.
export type TokenKind = 'verify' | 'reset';

interface TokenRecord {
  id: string; // sha256 du jeton
  kind: TokenKind;
  userId: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

const FILE = 'auth-tokens.json';
const TTL: Record<TokenKind, number> = { verify: 48 * 3600000, reset: 3600000 };
const hash = (t: string) => crypto.createHash('sha256').update(t).digest('hex');

function load(): TokenRecord[] {
  const now = Date.now();
  return readJson<TokenRecord[]>(FILE, []).filter((t) => new Date(t.expiresAt).getTime() > now);
}

export function issueToken(kind: TokenKind, userId: string, email: string): string {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();
  // Un seul lien valide à la fois par compte et par type.
  const list = load().filter((t) => !(t.kind === kind && t.userId === userId));
  list.push({ id: hash(token), kind, userId, email, createdAt: new Date(now).toISOString(), expiresAt: new Date(now + TTL[kind]).toISOString() });
  writeJson(FILE, list);
  return token;
}

// Vérifie et consomme le jeton (il ne peut servir qu'une fois).
export function consumeToken(kind: TokenKind, token: unknown): { userId: string; email: string } | null {
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return null;
  const id = hash(token);
  const list = load();
  const found = list.find((t) => t.id === id && t.kind === kind);
  if (!found) return null;
  writeJson(FILE, list.filter((t) => t !== found));
  return { userId: found.userId, email: found.email };
}

// Dernier envoi pour ce compte (pour espacer les renvois d'e-mail).
export function lastIssued(kind: TokenKind, userId: string): number {
  const t = load().find((x) => x.kind === kind && x.userId === userId);
  return t ? new Date(t.createdAt).getTime() : 0;
}
