import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserProfile {
  id: string;
  pseudo: string;
  email: string;
  discordId?: string;
  discordTag?: string;
  avatar?: string;
  fivemId?: string;
  phone?: string;
  createdAt: string;
  vipTier: string;
  isDiscordVerified?: boolean;
}

export interface StoredUser extends UserProfile {
  passwordHash: string;
  salt: string;
}

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

function ensureDb() {
  const dir = path.dirname(USERS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_PATH)) {
    fs.writeFileSync(USERS_PATH, '[]', 'utf-8');
  }
}

export function getUsers(): StoredUser[] {
  try {
    ensureDb();
    const data = fs.readFileSync(USERS_PATH, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (e) {
    console.error('Error reading users DB:', e);
    return [];
  }
}

export function saveUsers(users: StoredUser[]) {
  try {
    ensureDb();
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users DB:', e);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function upsertDiscordUser(
  discordId: string,
  displayName: string,
  avatar?: string,
  email?: string,
  handle?: string
): UserProfile {
  const users = getUsers();
  const index = users.findIndex((u) => u.discordId === discordId);
  const username = displayName;

  if (index !== -1) {
    users[index].pseudo = displayName;
    users[index].discordTag = handle || displayName;
    if (avatar) users[index].avatar = avatar;
    if (email) users[index].email = email;
    users[index].isDiscordVerified = true;
    saveUsers(users);
    const { passwordHash: _, salt: __, ...profile } = users[index];
    return profile;
  }

  // Create new profile linked to Discord
  const newUser: StoredUser = {
    id: `usr_d_${discordId}`,
    pseudo: displayName,
    email: email || `${(handle || username).toLowerCase().replace(/[^a-z0-9]/g, '')}@discord.user`,
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
  const { passwordHash: _, salt: __, ...profile } = newUser;
  return profile;
}

export function registerUser(
  pseudo: string,
  email: string,
  password: string,
  discordTag?: string,
  fivemId?: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPseudo = pseudo.trim();

  if (password.length < 6) {
    return { success: false, error: 'Password must contain at least 6 characters.' };
  }

  const exists = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail || u.pseudo.toLowerCase() === normalizedPseudo.toLowerCase()
  );

  if (exists) {
    return { success: false, error: 'An account already exists with this email or username.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    pseudo: normalizedPseudo,
    email: normalizedEmail,
    discordTag: discordTag ? discordTag.trim() : undefined,
    fivemId: fivemId ? fivemId.trim() : undefined,
    createdAt: new Date().toISOString(),
    vipTier: 'Atelier Member',
    passwordHash,
    salt,
  };

  users.push(newUser);
  saveUsers(users);

  const { passwordHash: _, salt: __, ...profile } = newUser;
  return { success: true, user: profile };
}

export function loginUser(identifier: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  const users = getUsers();
  const target = identifier.trim().toLowerCase();

  const found = users.find(
    (u) => u.email.toLowerCase() === target || u.pseudo.toLowerCase() === target
  );

  if (!found) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const computedHash = hashPassword(password, found.salt);
  if (computedHash !== found.passwordHash) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const { passwordHash: _, salt: __, ...profile } = found;
  return { success: true, user: profile };
}

export function getUserById(id: string): UserProfile | null {
  const users = getUsers();
  const found = users.find((u) => u.id === id || u.discordId === id);
  if (!found) return null;
  const { passwordHash: _, salt: __, ...profile } = found;
  return profile;
}

export function updateUserProfile(
  id: string,
  updates: { pseudo?: string; discordTag?: string; fivemId?: string; phone?: string }
): UserProfile | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id || u.discordId === id);
  if (index === -1) return null;

  if (updates.pseudo !== undefined && updates.pseudo.trim()) {
    users[index].pseudo = updates.pseudo.trim();
  }
  if (updates.discordTag !== undefined) {
    users[index].discordTag = updates.discordTag.trim();
  }
  if (updates.fivemId !== undefined) {
    users[index].fivemId = updates.fivemId.trim();
  }
  if (updates.phone !== undefined) {
    users[index].phone = updates.phone.trim();
  }

  saveUsers(users);
  const { passwordHash: _, salt: __, ...profile } = users[index];
  return profile;
}
