import { NextRequest, NextResponse } from 'next/server';
import { getAudit, requireAdmin } from '@/lib/team';

export const dynamic = 'force-dynamic';

// Journal d'activité en lecture seule (aucune route ne permet de le modifier ou de le vider).
export async function GET(req: NextRequest) {
  const ctx = requireAdmin(req, 'logs');
  if (ctx instanceof NextResponse) return ctx;
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase();
  const area = searchParams.get('area') || '';
  const logs = getAudit().filter((e) => {
    if (area && !e.action.startsWith(area)) return false;
    if (q && !`${e.by} ${e.action} ${e.target || ''} ${e.detail || ''}`.toLowerCase().includes(q)) return false;
    return true;
  });
  return NextResponse.json({ logs: logs.slice(0, 500), total: logs.length });
}
