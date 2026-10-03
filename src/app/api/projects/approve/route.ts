import { NextRequest, NextResponse } from 'next/server';
import { getRequests, saveRequests } from '@/lib/requestsDb';
import { getSessionUser } from '@/lib/session';
import { belongsTo, projectInfo, requestKind } from '@/lib/commerce';

// Le client valide la preview 3D de son projet (bouton dans son espace / son chat).
export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

  const { id } = await req.json();
  const requests = getRequests();
  const r = requests.find((x) => x.id === id && requestKind(x) === 'project');
  if (!r || !belongsTo(r, user)) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

  const p = projectInfo(r);
  if (p.stage !== 'preview') return NextResponse.json({ error: 'There is no preview waiting for your approval.' }, { status: 409 });

  const now = new Date().toISOString();
  r.project = { stage: 'approved', price: p.price, paymentStatus: p.paymentStatus, amountPaid: p.amountPaid, priority: p.priority, strictOptimization: p.strictOptimization, previews: p.previews, finalFiles: p.finalFiles, approvedAt: now, updatedAt: now };
  r.messages.push({ id: `msg_${Date.now()}_ok`, sender: 'client', text: '✅ I approve the 3D preview.', createdAt: now });
  r.status = 'pending';
  saveRequests(requests);
  return NextResponse.json({ success: true, project: r.project });
}
