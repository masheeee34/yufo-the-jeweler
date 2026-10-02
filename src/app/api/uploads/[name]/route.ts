import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MIME, UPLOADS_DIR, UPLOAD_NAME } from '../../../../lib/uploads';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!UPLOAD_NAME.test(name)) {
    return new NextResponse('Not found', { status: 404 });
  }
  const file = path.join(UPLOADS_DIR, name);
  if (!fs.existsSync(file)) {
    return new NextResponse('Not found', { status: 404 });
  }
  const ext = name.split('.').pop() as string;
  return new NextResponse(fs.readFileSync(file), {
    headers: {
      'Content-Type': MIME[ext],
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
