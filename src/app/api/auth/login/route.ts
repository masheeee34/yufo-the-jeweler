import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '../../../../lib/usersDb';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Identifiant et mot de passe requis.' }, { status: 400 });
    }

    const result = loginUser(identifier, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 });
  }
}
