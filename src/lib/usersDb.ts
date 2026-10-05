import fs from 'fs';
import path from 'path';
import { hashPassword } from './passwords';

// Comptes clients. Deux façons d'entrer : e-mail + mot de passe (adresse vérifiée), ou Discord.
// Le @nom d'utilisateur (username) est unique et sert à retrouver quelqu'un sur le site (tickets…).
export interface UserProfile {
  id: string;
  pseudo: string; // nom affiché
  username?: string; // @handle unique, en minuscules
  email: string;
  emailVerified?: boolean;
  hasPassword?: boolean; // calculé, jamais stocké
  avatarUrl?: string; // photo envoyée par le client (/api/uploads/…)
  discordId?: string;
  discordTag?: string;
  avatar?: string; // hash de l'avatar Discord
  fivemId?: string;
  phone?: string;
  createdAt: string;
  vipTier: string;
  isDiscordVerified?: boolean;
}

export interface StoredUser extends Omit<UserProfile, 'hasPassword'> {
  passwordHash: string;
  salt: string;
}

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

function ensureDb() {
  const dir = path.dirname(USERS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, '[]', 'utf-8');
}

let migrated = false;

export function getUsers(): StoredUser[] {
  try {
    ensureDb();
    const users: StoredUser[] = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8') || '[]');
    if (!migrated) {
      migrated = true;
      // Les comptes Discord existants reçoivent un @nom d'utilisateur tiré de leur pseudo Discord.
      let changed = false;
      for (const u of users) {
        if (!u.username && u.discordId) {
          u.username = uniqueUsername(u.discordTag || u.pseudo, users);
          changed = true;
        }
      }
      if (changed) saveUsers(users);
    }
    return users;
  } catch (e) {
    console.error('Error reading users DB:', e);
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  try {
    ensureDb();
    const tmp = `${USERS_PATH}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2), 'utf-8');
    fs.renameSync(tmp, USERS_PATH);
  } catch (e) {
    console.error('Error saving users DB:', e);
  }
}

export function toProfile(u: StoredUser): UserProfile {
  const { passwordHash, salt: _salt, ...profile } = u;
  return { ...profile, hasPassword: !!passwordHash };
}

export const isRealEmail = (email?: string) => !!email && !email.endsWith('@discord.user');
export const normEmail = (email: unknown) => String(email ?? '').trim().toLowerCase().slice(0, 200);
export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// Compte pleinement actif : adresse vérifiée (ou compte Discord) et @nom choisi.
export function isActive(u: Pick<UserProfile, 'emailVerified' | 'discordId' | 'username'>): boolean {
  return !!u.username && (!!u.emailVerified || !!u.discordId);
}

// ---------- @nom d'utilisateur ----------

const RESERVED = new Set([
  'admin', 'administrator', 'yufo', 'yufothejeweler', 'support', 'staff', 'moderator', 'mod', 'system', 'root', 'owner',
  'founder', 'team', 'help', 'official', 'discord', 'null', 'undefined', 'me', 'account', 'atelier', 'everyone', 'here',
]);

export function normalizeUsername(v: unknown): string {
  return String(v ?? '').trim().replace(/^@+/, '').toLowerCase();
}

export function usernameProblem(name: string, exceptUserId?: string, users: StoredUser[] = getUsers()): string | null {
  if (name.length < 3 || name.length > 20) return 'Your username must be 3 to 20 characters long.';
  if (!/^[a-z0-9_.]+$/.test(name)) return 'Use only letters, numbers, dots and underscores.';
  if (/^[._]|[._]$|\.\./.test(name)) return 'Your username cannot start or end with a dot or underscore.';
  if (RESERVED.has(name)) return 'This username is reserved.';
  const taken = users.some(
    (u) => u.id !== exceptUserId && (u.username === name || (!u.username && u.pseudo?.toLowerCase() === name))
  );
  return taken ? 'This username is already taken.' : null;
}

function uniqueUsername(base: string, users: StoredUser[]): string {
  let root = String(base || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9_.]/g, '')
    .replace(/^[._]+|[._]+$/g, '')
    .replace(/\.{2,}/g, '.')
    .slice(0, 16);
  if (root.length < 3 || RESERVED.has(root)) root = `collector${root}`.slice(0, 16);
  let name = root;
  for (let i = 2; users.some((u) => u.username === name); i++) name = `${root}${i}`;
  return name;
}

// ---------- Lecture ----------

export function getStoredUser(id: string): StoredUser | null {
  return getUsers().find((u) => u.id === id || u.discordId === id) || null;
}

export function getUserById(id: string): UserProfile | null {
  const u = getStoredUser(id);
  return u ? toProfile(u) : null;
}

export function getUserByUsername(name: string): UserProfile | null {
  const n = normalizeUsername(name);
  const u = getUsers().find((x) => x.username === n);
  return u ? toProfile(u) : null;
}

export function findUserByEmail(email: string): StoredUser | null {
  const e = normEmail(email);
  if (!isRealEmail(e)) return null;
  return getUsers().find((u) => normEmail(u.email) === e) || null;
}

// Connexion : e-mail, @nom d'utilisateur, ou ancien pseudo d'un compte avec mot de passe.
export function findUserByLogin(identifier: string): StoredUser | null {
  const t = normalizeUsername(identifier);
  if (!t) return null;
  const users = getUsers().filter((u) => u.passwordHash);
  return (
    users.find((u) => normEmail(u.email) === t) ||
    users.find((u) => u.username === t) ||
    users.find((u) => !u.username && u.pseudo.toLowerCase() === t) ||
    null
  );
}

// ---------- Écriture ----------

function update(id: string, fn: (u: StoredUser, all: StoredUser[]) => void): UserProfile | null {
  const users = getUsers();
  const u = users.find((x) => x.id === id);
  if (!u) return null;
  fn(u, users);
  saveUsers(users);
  return toProfile(u);
}

export function createEmailUser(email: string, password: string): { user?: UserProfile; error?: string } {
  const users = getUsers();
  const e = normEmail(email);
  if (users.some((u) => normEmail(u.email) === e)) {
    return { error: 'An account already exists with this email. Sign in instead.' };
  }
  const user: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pseudo: e.split('@')[0].slice(0, 30) || 'Collector',
    email: e,
    emailVerified: false,
    createdAt: new Date().toISOString(),
    vipTier: 'Atelier Member',
    passwordHash: hashPassword(password),
    salt: '',
  };
  users.push(user);
  saveUsers(users);
  return { user: toProfile(user) };
}

export const setPassword = (id: string, password: string) =>
  update(id, (u) => {
    u.passwordHash = hashPassword(password);
    u.salt = '';
  });

// Remplace une ancienne empreinte PBKDF2 par scrypt une fois le mot de passe vérifié.
export const upgradePasswordHash = (id: string, password: string) => setPassword(id, password);

export const markEmailVerified = (id: string) =>
  update(id, (u) => {
    u.emailVerified = true;
  });

export function setUsername(id: string, raw: string): { user?: UserProfile; error?: string } {
  const name = normalizeUsername(raw);
  const users = getUsers();
  const problem = usernameProblem(name, id, users);
  if (problem) return { error: problem };
  const u = users.find((x) => x.id === id);
  if (!u) return { error: 'Account not found.' };
  // Le nom affiché suit le @nom tant que le client ne l'a pas personnalisé.
  const followPseudo = !u.username || u.pseudo === u.username || u.pseudo === normEmail(u.email).split('@')[0];
  u.username = name;
  if (followPseudo) u.pseudo = name;
  saveUsers(users);
  return { user: toProfile(u) };
}

export function upsertDiscordUser(
  discordId: string,
  displayName: string,
  avatar?: string,
  email?: string,
  handle?: string
): UserProfile {
  const users = getUsers();
  const existing = users.find((u) => u.discordId === discordId);

  if (existing) {
    // Le nom affiché n'est repris de Discord que pour les comptes créés avec Discord.
    if (!existing.passwordHash) existing.pseudo = displayName;
    existing.discordTag = handle || displayName;
    if (avatar) existing.avatar = avatar;
    if (email && !isRealEmail(existing.email)) existing.email = email;
    existing.isDiscordVerified = true;
    if (!existing.username) existing.username = uniqueUsername(handle || displayName, users);
    saveUsers(users);
    return toProfile(existing);
  }

  const newUser: StoredUser = {
    id: `usr_d_${discordId}`,
    pseudo: displayName,
    username: uniqueUsername(handle || displayName, users),
    email: email || `${(handle || displayName).toLowerCase().replace(/[^a-z0-9]/g, '')}@discord.user`,
    discordId,
    discordTag: handle || displayName,
    avatar: avatar || undefined,
    createdAt: new Date().toISOString(),
    vipTier: 'Atelier Member',
    isDiscordVerified: true,
    passwordHash: '',
    salt: '',
  };
  users.push(newUser);
  saveUsers(users);
  return toProfile(newUser);
}

// Relie un compte Discord à un compte e-mail existant (liaison facultative).
export function linkDiscord(id: string, discordId: string, handle: string, avatar?: string): { user?: UserProfile; error?: string } {
  const users = getUsers();
  const other = users.find((u) => u.discordId === discordId && u.id !== id);
  if (other) return { error: 'This Discord account is already linked to another YUFO account.' };
  const u = users.find((x) => x.id === id);
  if (!u) return { error: 'Account not found.' };
  u.discordId = discordId;
  u.discordTag = handle;
  if (avatar) u.avatar = avatar;
  u.isDiscordVerified = true;
  saveUsers(users);
  return { user: toProfile(u) };
}

export function unlinkDiscord(id: string): { user?: UserProfile; error?: string } {
  const users = getUsers();
  const u = users.find((x) => x.id === id);
  if (!u) return { error: 'Account not found.' };
  if (!u.passwordHash || !u.emailVerified) {
    return { error: 'Add a verified email and a password first, so you can still sign in without Discord.' };
  }
  u.discordId = undefined;
  u.discordTag = undefined;
  u.avatar = undefined;
  u.isDiscordVerified = false;
  saveUsers(users);
  return { user: toProfile(u) };
}

export function updateUserProfile(
  id: string,
  updates: { pseudo?: string; discordTag?: string; fivemId?: string; phone?: string; avatarUrl?: string | null }
): UserProfile | null {
  return update(id, (u) => {
    if (updates.pseudo !== undefined && updates.pseudo.trim()) u.pseudo = updates.pseudo.trim().slice(0, 40);
    if (updates.discordTag !== undefined && !u.discordId) u.discordTag = updates.discordTag.trim().slice(0, 40);
    if (updates.fivemId !== undefined) u.fivemId = updates.fivemId.trim().slice(0, 80);
    if (updates.phone !== undefined) u.phone = updates.phone.trim().slice(0, 30);
    if (updates.avatarUrl !== undefined) u.avatarUrl = updates.avatarUrl || undefined;
  });
}
