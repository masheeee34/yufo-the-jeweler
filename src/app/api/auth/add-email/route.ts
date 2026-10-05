import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { findUserByEmail, getUsers, isEmail, isRealEmail, normEmail, saveUsers, toProfile } from '@/lib/usersDb';
import { hashPassword, passwordProblem } from '@/lib/passwords';
import { issueToken } from '@/lib/authTokens';
import { mailConfigured, sendMail, siteUrl, verifyEmailMail } from '@/lib/mailer';
import { rateLimited } from '@/lib/rateLimit';

// Compte créé avec Discord : ajout d'une adresse e-mail et d'un mot de passe pour se connecter sans Discord.
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.hasPassword && isRealEmail(user.email)) {
    return NextResponse.json({ error: 'Your account already has an email and a password.' }, { status: 400 });
  }
  if (!mailConfigured()) return NextResponse.json({ error: 'Email delivery is not available right now.' }, { status: 503 });
  if (rateLimited(`addemail:${user.id}`, 5, 3600000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const email = normEmail(body.email);
  if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  const problem = passwordProblem(body.password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  const other = findUserByEmail(email);
  if (other && other.id !== user.id) {
    return NextResponse.json({ error: 'This email is already used by another account.' }, { status: 409 });
  }

  const users = getUsers();
  const u = users.find((x) => x.id === user.id)!;
  u.email = email;
  u.emailVerified = false;
  u.passwordHash = hashPassword(String(body.password));
  u.salt = '';
  saveUsers(users);
  const token = issueToken('verify', u.id, email);
  await sendMail(verifyEmailMail(email, `${siteUrl(req)}/account/verify?token=${token}`));
  return NextResponse.json({ success: true, user: toProfile(u) });
}
