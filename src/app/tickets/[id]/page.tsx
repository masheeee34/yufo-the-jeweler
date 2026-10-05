'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { TicketShell } from '../../../components/tickets/TicketShell';
import { TicketView } from '../../../components/tickets/TicketView';

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <TicketShell>
      <TicketView id={String(id)} />
    </TicketShell>
  );
}
