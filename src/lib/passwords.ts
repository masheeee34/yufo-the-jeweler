import crypto from 'crypto';

// Mots de passe : scrypt avec sel aléatoire, stocké sous la forme « scrypt$<sel>$<empreinte> ».
// Les anciens comptes (PBKDF2, 1 000 tours) restent acceptés et sont convertis à la connexion suivante.
const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: { passwordHash?: string; salt?: string }): { ok: boolean; legacy: boolean } {
  const ph = stored.passwordHash || '';
  if (!ph) return { ok: false, legacy: false };
  if (ph.startsWith('scrypt$')) {
    const [, salt, hash] = ph.split('$');
    const test = crypto.scryptSync(password, salt, KEYLEN);
    const ref = Buffer.from(hash, 'hex');
    return { ok: ref.length === test.length && crypto.timingSafeEqual(ref, test), legacy: false };
  }
  if (!stored.salt) return { ok: false, legacy: false };
  const test = crypto.pbkdf2Sync(password, stored.salt, 1000, 64, 'sha512');
  const ref = Buffer.from(ph, 'hex');
  return { ok: ref.length === test.length && crypto.timingSafeEqual(ref, test), legacy: true };
}

// Règle simple et compréhensible : 8 caractères minimum, pas uniquement des chiffres.
export function passwordProblem(password: unknown): string | null {
  const p = String(password ?? '');
  if (p.length < 8) return 'Your password must be at least 8 characters long.';
  if (p.length > 200) return 'Your password is too long.';
  if (/^\d+$/.test(p)) return 'Your password cannot be only numbers.';
  return null;
}
