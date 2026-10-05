import fs from 'fs';
import path from 'path';
import type { TicketPermissions, TicketPriority } from './ticketDefaults';

export interface TicketFile {
  id: string; // nom sur le disque, dans data/ticket-files/
  name: string; // nom d'origine
  size: number;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'admin';
  text: string;
  createdAt: string;
  attachments?: string[]; // images (data/uploads)
  files?: TicketFile[]; // fichiers joints dans un ticket
  authorId?: string; // compte qui a écrit le message
  authorName?: string;
  editedAt?: string;
  hidden?: boolean; // masqué aux clients, visible par l'équipe
  deletedAt?: string;
  deletedBy?: string;
}

export type TicketRole = 'client' | 'member' | 'staff';

export interface TicketMember {
  userId: string;
  role: TicketRole;
  addedAt: string;
  addedBy?: string; // nom de la personne qui l'a ajouté
  muted?: boolean;
  revoked?: boolean;
  notify?: boolean; // reçoit les notifications (oui par défaut)
}

export interface TicketEvent {
  id: string;
  at: string;
  by: string;
  text: string;
}

export interface TicketData {
  title: string;
  statusId: string;
  priority: TicketPriority;
  locked: boolean;
  paused: boolean;
  closed: boolean;
  archived: boolean;
  perms: TicketPermissions;
  members: TicketMember[];
  pinned: string[]; // identifiants des messages épinglés
  events: TicketEvent[];
  rev: number; // augmente à chaque changement (rafraîchissement des pages ouvertes)
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  id: string;
  pseudo: string;
  discordId?: string;
  discordChannelId?: string;
  discordThreadId?: string;
  discordMessageId?: string;
  subject: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'answered' | 'closed';
  messages: ChatMessage[];
  order?: OrderData;
  project?: ProjectData;
  ticketType?: 'custom' | 'order' | 'general';
  linkedId?: string; // ticket relié à une commande ou un projet
  internalNotes?: InternalNote[]; // jamais envoyées au client
  userId?: string; // compte du client (achats invités rattachés après vérification de l'e-mail)
  ticket?: TicketData; // espace de conversation et de suivi d'une demande sur mesure
}

// Statut de la commande (traitement) et statut du paiement sont séparés.
export type OrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface OrderData {
  items: { name: string; reference?: string; price: number; quantity: number; productId?: string }[];
  total: number;
  subtotal?: number; // avant réduction personnelle
  discountPercent?: number;
  email?: string;
  paymentMethod?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  amountPaid?: number;
  updatedAt?: string;
}

export interface InternalNote {
  id: string;
  by: string;
  at: string;
  text: string;
}

export type ProjectStage = 'brief' | 'quoted' | 'in_progress' | 'preview' | 'approved' | 'delivered' | 'cancelled';

export interface ProjectData {
  stage: ProjectStage;
  price?: number;
  paymentStatus?: PaymentStatus;
  amountPaid?: number;
  priority?: boolean; // Priority delivery
  strictOptimization?: boolean;
  previews: { file: string; at: string; by: string }[]; // fichiers dans data/uploads
  finalFiles: { label: string; url: string; at: string }[];
  approvedAt?: string; // validation 3D par le client
  updatedAt?: string;
}

// Commandes et projets acceptés ne s'effacent jamais ; seules les conversations et les briefs
// restés sans suite disparaissent après leur délai (72 h).
function isPermanent(r: ClientRequest) {
  if (r.id.startsWith('YUF-ORD')) return true;
  if (r.ticket) return true; // un ticket ne disparaît que s'il est supprimé
  return !!r.project && r.project.stage !== 'brief' && r.project.stage !== 'cancelled';
}

const DB_PATH = path.join(process.cwd(), 'data', 'requests.json');

export function getRequests(): ClientRequest[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DB_PATH, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const items: ClientRequest[] = JSON.parse(data || '[]');
    const now = new Date().getTime();

    // Auto-prune 72 hours expiration
    const active = items.filter((item) => isPermanent(item) || new Date(item.expiresAt).getTime() > now);
    if (active.length !== items.length) {
      saveRequests(active);
    }
    return active;
  } catch (e) {
    console.error('Error reading requests DB:', e);
    return [];
  }
}

export function saveRequests(items: ClientRequest[]) {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = `${DB_PATH}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(items, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_PATH);
  } catch (e) {
    console.error('Error saving requests DB:', e);
  }
}
