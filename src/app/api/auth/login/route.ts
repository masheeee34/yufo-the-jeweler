import { NextRequest, NextResponse } from 'next/server';
import { findUserByLogin, toProfile, upgradePasswordHash } from '@/lib/usersDb';
import { createSession } from '@/lib/session';
import { verifyPassword } from '@/lib/passwords';
import { clientIp, rateLimited } from '@/lib/rateLimit';

// Connexion par e-mail (ou @nom d'utilisateur) et mot de passe.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = String(body.identifier ?? '').trim().toLowerCase().slice(0, 200);
    const password = String(body.password ?? '');
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Enter your email and your password.' }, { status: 400 });
    }
    // Contre les essais en série : par adresse IP et par compte visé.
    if (rateLimited(`login-ip:${clientIp(req)}`, 20, 600000) || rateLimited(`login-id:${identifier}`, 8, 600000)) {
      return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes and try again.' }, { status: 429 });
    }

    const stored = findUserByLogin(identifier);
    const check = stored ? verifyPassword(password, stored) : { ok: false, legacy: false };
    if (!stored || !check.ok) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }
    if (check.legacy) upgradePasswordHash(stored.id, password);

    const res = NextResponse.json({ success: true, user: toProfile(stored) });
    createSession(req, res, stored.id, body.remember !== false);
    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Sign-in failed. Please try again.' }, { status: 500 });
  }
}
