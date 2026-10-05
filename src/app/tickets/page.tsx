'use client';

import React from 'react';
import Link from 'next/link';
import { TicketShell } from '../../components/tickets/TicketShell';
import { TicketList } from '../../components/tickets/TicketList';

export default function TicketsPage() {
  return (
    <TicketShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Tickets</h1>
            <p className="text-sm text-zinc-400 mt-1">Your private conversations with the atelier, one per custom project.</p>
          </div>
          <Link href="/custom-orders" className="self-start h-10 px-5 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold inline-flex items-center">
            New custom request
          </Link>
        </div>
        <TicketList />
      </div>
    </TicketShell>
  );
}
