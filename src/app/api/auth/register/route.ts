import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '../../../../lib/usersDb';

export async function POST(req: NextRequest) {
  try {
    const { pseudo, email, password, discordTag } = await req.json();

    if (!pseudo || !email || !password) {
      return NextResponse.json({ error: 'Pseudo, email et mot de passe requis.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' }, { status: 400 });
    }

    const result = registerUser(pseudo, email, password, discordTag);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 });
  }
}
