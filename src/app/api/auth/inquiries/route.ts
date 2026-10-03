import { NextRequest, NextResponse } from 'next/server';
import { getRequests } from '../../../../lib/requestsDb';
import { getSessionUser } from '../../../../lib/session';
import { belongsTo, publicRequest } from '../../../../lib/commerce';

// Demandes et commandes du client connecté (plus de recherche par email ou pseudo passés en paramètre).
export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ inquiries: [] });
  }
  const inquiries = getRequests().filter((r) => belongsTo(r, user)).map(publicRequest);
  return NextResponse.json({ inquiries });
}
