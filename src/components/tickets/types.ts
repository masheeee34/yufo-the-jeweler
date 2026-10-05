import type { StatusTone, TicketPermissions } from '../../lib/ticketDefaults';

export interface TStatus {
  id: string;
  label: string;
  tone: StatusTone;
  important: boolean;
}

export interface TPerson {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  discordId: string;
  avatar: string;
}

export type TRole = 'client' | 'member' | 'staff';

export interface TMember extends TPerson {
  userId: string;
  role: TRole;
  isTeam: boolean;
  muted: boolean;
  revoked?: boolean;
  notify?: boolean;
  addedBy?: string;
  addedAt?: string;
}

export interface TMessage {
  id: string;
  author: TPerson;
  role: TRole;
  text: string;
  createdAt: string;
  editedAt?: string;
  images: string[];
  files: { id: string; name: string; size: number }[];
  hidden: boolean;
  deleted: boolean;
  pinned: boolean;
  mine: boolean;
}

export interface Ticket {
  id: string;
  rev: number;
  etag?: string;
  title: string;
  status: TStatus;
  priority: string;
  priorityLabel: string;
  locked: boolean;
  paused: boolean;
  closed: boolean;
  archived: boolean;
  perms: TicketPermissions;
  createdAt: string;
  updatedAt: string;
  messages: TMessage[];
  members: TMember[];
  project: {
    piece?: string;
    budget?: string;
    duration?: string;
    wornBy?: string;
    vision?: string;
    stage?: string;
    price?: number;
    paymentStatus?: string;
    references: string[];
    previews: { url: string; at: string }[];
    finalFiles: { label: string; url: string; at: string }[];
  };
  viewer: {
    userId: string;
    canManage: boolean;
    canDelete: boolean;
    canPost: boolean;
    postBlock: string | null;
    canImages: boolean;
    canFiles: boolean;
    canDownload: boolean;
  };
  events?: { id: string; at: string; by: string; text: string }[];
  statuses?: TStatus[];
  sound: string;
  soundVolume: number;
  maxFileMb: number;
}

export interface TicketSummary {
  id: string;
  title: string;
  status: TStatus;
  priority: string;
  locked: boolean;
  paused: boolean;
  closed: boolean;
  archived: boolean;
  updatedAt: string;
  createdAt: string;
  client: string;
  members: number;
  lastMessage: { text: string; at: string; fromStaff: boolean } | null;
  mine: boolean;
}

export const ROLE_LABEL: Record<TRole, string> = { client: 'Client', member: 'Member', staff: 'Staff' };

export const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  if (m < 1440) return `${Math.floor(m / 60)}h`;
  if (m < 10080) return `${Math.floor(m / 1440)}d`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export const fileSize = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
