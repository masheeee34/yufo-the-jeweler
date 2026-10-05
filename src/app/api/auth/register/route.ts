import { NextRequest, NextResponse } from 'next/server';
import { createEmailUser, isEmail, normEmail } from '@/lib/usersDb';
import { createSession } from '@/lib/session';
import { passwordProblem } from '@/lib/passwords';
import { issueToken } from '@/lib/authTokens';
import { mailConfigured, sendMail, siteUrl, verifyEmailMail } from '@/lib/mailer';
import { clientIp, rateLimited } from '@/lib/rateLimit';

// Création d'un compte avec e-mail + mot de passe. Le compte est actif une fois l'adresse vérifiée
// (lien envoyé par e-mail) et le @nom d'utilisateur choisi.
export async function POST(req: NextRequest) {
  try {
    if (rateLimited(`register:${clientIp(req)}`, 5, 3600000)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }
    if (!mailConfigured()) {
      return NextResponse.json(
        { error: 'Email sign-up is not available yet. Continue with Discord, or check out as a guest.' },
        { status: 503 }
      );
    }
    const body = await req.json().catch(() => ({}));
    const email = normEmail(body.email);
    if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    const problem = passwordProblem(body.password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const { user, error } = createEmailUser(email, String(body.password));
    if (!user) return NextResponse.json({ error }, { status: 409 });

    const token = issueToken('verify', user.id, user.email);
    const sent = await sendMail(verifyEmailMail(user.email, `${siteUrl(req)}/account/verify?token=${token}`));

    const res = NextResponse.json({ success: true, user, emailSent: sent });
    createSession(req, res, user.id, body.remember !== false);
    return res;
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Your account could not be created. Please try again.' }, { status: 500 });
  }
}
