import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, isEmail, normEmail } from '@/lib/usersDb';
import { issueToken } from '@/lib/authTokens';
import { mailConfigured, resetPasswordMail, sendMail, siteUrl } from '@/lib/mailer';
import { clientIp, rateLimited } from '@/lib/rateLimit';

// Mot de passe oublié : la réponse est toujours la même, qu'un compte existe ou non.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = normEmail(body.email);
  if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  if (!mailConfigured()) return NextResponse.json({ error: 'Email delivery is not available right now.' }, { status: 503 });
  if (rateLimited(`forgot-ip:${clientIp(req)}`, 10, 3600000) || rateLimited(`forgot:${email}`, 3, 3600000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  const user = findUserByEmail(email);
  if (user && user.passwordHash) {
    const token = issueToken('reset', user.id, email);
    await sendMail(resetPasswordMail(email, `${siteUrl(req)}/account/reset?token=${token}`));
  }
  return NextResponse.json({ success: true });
}
