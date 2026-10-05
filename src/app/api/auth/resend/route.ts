import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { issueToken, lastIssued } from '@/lib/authTokens';
import { mailConfigured, sendMail, siteUrl, verifyEmailMail } from '@/lib/mailer';
import { isRealEmail } from '@/lib/usersDb';
import { rateLimited } from '@/lib/rateLimit';

// Renvoie le lien de vérification (une fois par minute au plus).
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.emailVerified || !isRealEmail(user.email)) {
    return NextResponse.json({ error: 'Your email is already confirmed.' }, { status: 400 });
  }
  if (!mailConfigured()) return NextResponse.json({ error: 'Email delivery is not available right now.' }, { status: 503 });
  if (Date.now() - lastIssued('verify', user.id) < 60000 || rateLimited(`resend:${user.id}`, 5, 3600000)) {
    return NextResponse.json({ error: 'Please wait a minute before asking for a new link.' }, { status: 429 });
  }
  const token = issueToken('verify', user.id, user.email);
  const ok = await sendMail(verifyEmailMail(user.email, `${siteUrl(req)}/account/verify?token=${token}`));
  return ok
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: 'The email could not be sent. Please try again later.' }, { status: 502 });
}
