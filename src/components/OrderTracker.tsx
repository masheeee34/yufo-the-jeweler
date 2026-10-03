'use client';

import React from 'react';

type Step = { key: string; label: string; hint: string };

const PROJECT_STEPS: Step[] = [
  { key: 'brief', label: 'Request received', hint: 'We are reading your brief.' },
  { key: 'quoted', label: 'Quote sent', hint: 'Price and timeline agreed with you.' },
  { key: 'in_progress', label: 'In the workshop', hint: 'Your piece is being sculpted.' },
  { key: 'preview', label: '3D preview', hint: 'Check the preview and approve it, or ask for changes.' },
  { key: 'approved', label: 'Approved', hint: 'Final rigging and optimisation.' },
  { key: 'delivered', label: 'Delivered', hint: 'Your files are in « My files ».' },
];

const ORDER_STEPS: Step[] = [
  { key: 'placed', label: 'Order placed', hint: 'We received your order.' },
  { key: 'paid', label: 'Payment confirmed', hint: 'Your files are unlocked in « My files ».' },
  { key: 'processing', label: 'Processing', hint: 'We are preparing your delivery.' },
  { key: 'delivered', label: 'Delivered', hint: 'Enjoy your piece in game.' },
];

// Étape en cours d'une commande ou d'un projet.
function current(inq: { id: string; project?: { stage?: string }; order?: { status?: string; paymentStatus?: string } }): { steps: Step[]; index: number; cancelled: boolean } {
  if (inq.project) {
    const stage = inq.project.stage || 'brief';
    return { steps: PROJECT_STEPS, index: Math.max(0, PROJECT_STEPS.findIndex((s) => s.key === stage)), cancelled: stage === 'cancelled' };
  }
  const o = inq.order;
  if (!o) return { steps: ORDER_STEPS, index: inq.id.startsWith('YUF-ORD') ? 3 : 0, cancelled: false };
  const paid = o.paymentStatus === 'paid' || o.paymentStatus === 'partial';
  const index = o.status === 'delivered' ? 3 : o.status === 'processing' ? 2 : paid ? 1 : 0;
  return { steps: ORDER_STEPS, index, cancelled: o.status === 'cancelled' || o.paymentStatus === 'refunded' };
}

// Suivi vertical : rail, étapes franchies en blanc, repère qui se pose sur l'étape en cours.
export function OrderTracker({ inquiry }: { inquiry: { id: string; project?: { stage?: string }; order?: { status?: string; paymentStatus?: string } } }) {
  const { steps, index, cancelled } = current(inquiry);
  if (cancelled) return <p className="text-xs text-rose-300">This order was cancelled or refunded.</p>;
  const ROW = 50;
  return (
    <div className="relative pl-6" style={{ height: steps.length * ROW }}>
      {/* rail */}
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
      <span className="tracker-fill absolute left-[7px] top-2 w-px bg-white" style={{ height: index * ROW }} />
      {/* repère */}
      <span className="tracker-marker absolute left-0 w-[15px] h-[15px] rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.6)]" style={{ top: index * ROW + 1 }} />
      {steps.map((s, n) => (
        <div key={s.key} className="absolute left-6 right-0" style={{ top: n * ROW - 2, height: ROW }}>
          <p className={`text-[13px] leading-tight ${n === index ? 'text-white font-semibold' : n < index ? 'text-zinc-300' : 'text-zinc-600'}`}>{s.label}</p>
          {n === index && <p className="text-[11px] text-zinc-400 mt-0.5">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export function trackerLabel(inquiry: { id: string; project?: { stage?: string }; order?: { status?: string; paymentStatus?: string } }) {
  const { steps, index, cancelled } = current(inquiry);
  return cancelled ? 'Cancelled' : steps[index].label;
}
