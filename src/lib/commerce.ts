import { ClientRequest, OrderData, ProjectData } from './requestsDb';
import { getUsers, UserProfile } from './usersDb';

export const isPaid = (s?: string) => s === 'paid' || s === 'partial';

export type RequestKind = 'order' | 'project' | 'ticket';

export function requestKind(r: ClientRequest): RequestKind {
  if (r.id.startsWith('YUF-ORD')) return 'order';
  if (r.id.startsWith('YUF-INQ')) return 'project';
  return 'ticket';
}

const field = (text: string, label: string) => {
  const m = text.match(new RegExp(`^${label}:\\s*(.+)$`, 'mi'));
  return m ? m[1].trim() : undefined;
};

// Données de commande : celles enregistrées, sinon reconstituées depuis le message (anciennes commandes).
export function orderInfo(r: ClientRequest): OrderData {
  if (r.order) return r.order;
  const text = r.messages[0]?.text || '';
  const items = [...text.matchAll(/^-\s*(\d+)x\s+(.+?)\s+\(Ref:\s*([^,]+),\s*Price:\s*\$([\d.]+)\)/gm)].map((m) => ({
    quantity: Number(m[1]),
    name: m[2],
    reference: m[3],
    price: Number(m[4]),
  }));
  const total = Number((field(text, 'TOTAL') || r.subject.match(/Total:\s*\$([\d.]+)/)?.[1] || '0').replace(/[^\d.]/g, ''));
  return {
    items,
    total,
    email: field(text, 'EMAIL'),
    paymentMethod: field(text, 'PAYMENT METHOD'),
    // Anciennes commandes, enregistrées comme « Paid Allocation » et livrées automatiquement.
    status: 'delivered',
    paymentStatus: 'paid',
  };
}

export function projectInfo(r: ClientRequest): ProjectData & { piece?: string; budget?: string; duration?: string; wornBy?: string; vision?: string } {
  const text = r.messages[0]?.text || '';
  const saved: ProjectData = r.project || { stage: 'brief', previews: [], finalFiles: [] };
  const base: ProjectData = {
    ...saved,
    // Anciennes previews enregistrées comme simples noms de fichiers.
    previews: (saved.previews || []).map((p: any) => (typeof p === 'string' ? { file: p, at: r.createdAt, by: 'YUFO' } : p)),
    finalFiles: saved.finalFiles || [],
  };
  return {
    ...base,
    piece: field(text, 'PIECE'),
    budget: field(text, 'BUDGET'),
    duration: field(text, 'DELIVERY'),
    wornBy: field(text, 'WORN BY'),
    vision: text.split(/^VISION:\s*$/m)[1]?.replace(/\n*REFERENCE IMAGES:[\s\S]*$/, '').trim(),
  };
}

// Dernier message du client resté sans réponse de l'atelier.
export function awaitingReply(r: ClientRequest): boolean {
  const last = r.messages[r.messages.length - 1];
  return !!last && last.sender === 'client' && r.status !== 'closed';
}

// Rattache une demande à un compte client (Discord en priorité, puis pseudo).
export function belongsTo(r: ClientRequest, u: Pick<UserProfile, 'discordId' | 'pseudo' | 'email'>): boolean {
  if (r.discordId && u.discordId) return r.discordId === u.discordId;
  const text = (r.messages[0]?.text || '').toLowerCase();
  if (u.discordId && text.includes(`(${u.discordId})`)) return true;
  if (u.email && !u.email.endsWith('@discord.user') && text.includes(u.email.toLowerCase())) return true;
  return r.pseudo.toLowerCase() === u.pseudo.toLowerCase();
}

export interface CustomerSummary {
  id: string;
  pseudo: string;
  email?: string;
  discordId?: string;
  discordTag?: string;
  avatar?: string;
  fivemId?: string;
  createdAt: string;
  vipTier: string;
  orders: number;
  projects: number;
  tickets: number;
  spent: number;
  lastActivity?: string;
}

export function customerSummaries(requests: ClientRequest[]): CustomerSummary[] {
  return getUsers().map((u) => {
    const mine = requests.filter((r) => belongsTo(r, u));
    const orders = mine.filter((r) => requestKind(r) === 'order');
    const projects = mine.filter((r) => requestKind(r) === 'project').map(projectInfo);
    const spent =
      orders.map(orderInfo).filter((o) => isPaid(o.paymentStatus)).reduce((sum, o) => sum + (o.amountPaid ?? o.total), 0) +
      projects.filter((p) => isPaid(p.paymentStatus)).reduce((sum, p) => sum + (p.amountPaid ?? p.price ?? 0), 0);
    const last = mine.map((r) => r.messages[r.messages.length - 1]?.createdAt || r.createdAt).sort().pop();
    return {
      id: u.id,
      pseudo: u.pseudo,
      email: u.email?.endsWith('@discord.user') ? undefined : u.email,
      discordId: u.discordId,
      discordTag: u.discordTag,
      avatar: u.avatar,
      fivemId: u.fivemId,
      createdAt: u.createdAt,
      vipTier: u.vipTier,
      orders: orders.length,
      projects: mine.filter((r) => requestKind(r) === 'project').length,
      tickets: mine.filter((r) => requestKind(r) === 'ticket').length,
      spent,
      lastActivity: last,
    };
  });
}

// Version envoyée au client : sans les notes internes de l'atelier.
export function publicRequest(r: ClientRequest): Omit<ClientRequest, 'internalNotes'> {
  const { internalNotes: _notes, ...rest } = r;
  return rest;
}
