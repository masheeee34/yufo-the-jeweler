import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '../../../../lib/session';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  destroySession(req, response);
  return response;
}
