import { NextRequest, NextResponse } from 'next/server';
import { getRequests } from '../../../../lib/requestsDb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const pseudo = (searchParams.get('pseudo') || '').trim().toLowerCase();

  if (!email && !pseudo) {
    return NextResponse.json({ inquiries: [] });
  }

  const allRequests = getRequests();
  const userInquiries = allRequests.filter((r) => {
    const rPseudo = (r.pseudo || '').toLowerCase();
    const firstMsg = r.messages?.[0]?.text?.toLowerCase() || '';

    return (
      (email && (firstMsg.includes(email) || rPseudo.includes(email))) ||
      (pseudo && (rPseudo === pseudo || firstMsg.includes(pseudo)))
    );
  });

  return NextResponse.json({ inquiries: userInquiries });
}
