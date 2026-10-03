import type { Tone } from './ui';

// Libellés et couleurs des statuts, partagés par toutes les pages.
export const PAYMENT: Record<string, { label: string; tone: Tone }> = {
  unpaid: { label: 'Unpaid', tone: 'red' },
  partial: { label: 'Partially paid', tone: 'amber' },
  paid: { label: 'Paid', tone: 'green' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

export const ORDER: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Pending', tone: 'amber' },
  processing: { label: 'Processing', tone: 'blue' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const STAGE: Record<string, { label: string; tone: Tone }> = {
  brief: { label: 'New brief', tone: 'amber' },
  quoted: { label: 'Quoted', tone: 'blue' },
  in_progress: { label: 'In progress', tone: 'violet' },
  preview: { label: 'Preview sent', tone: 'blue' },
  approved: { label: '3D approved', tone: 'green' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};
export const STAGE_ORDER = ['brief', 'quoted', 'in_progress', 'preview', 'approved', 'delivered', 'cancelled'];

// Statuts de ticket : pending / answered / closed côté données.
export const TICKET: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Open', tone: 'amber' },
  answered: { label: 'Waiting for customer', tone: 'blue' },
  closed: { label: 'Resolved', tone: 'green' },
};

export const TICKET_TYPE: Record<string, string> = {
  custom: 'Custom project',
  order: 'Order support',
  general: 'General inquiry',
};

export const PRODUCT_STATUS: Record<string, { label: string; tone: Tone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  published: { label: 'Published', tone: 'green' },
  hidden: { label: 'Hidden', tone: 'amber' },
};

export const ROLE_LABEL: Record<string, string> = { founder: 'Founder', admin: 'Admin', jeweler: 'Jeweler', support: 'Support', moderator: 'Moderator' };
