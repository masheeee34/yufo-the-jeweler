import { readJson, writeJson } from './jsonStore';
import type { TicketFile } from './requestsDb';

// Fichiers envoyés dans un ticket : d'abord mis en attente (envoi), puis attachés au message publié.
// Un fichier en attente ne peut être attaché que par la personne qui l'a envoyé, dans le même ticket.
interface PendingUpload extends TicketFile {
  by: string;
  ticketId: string;
  at: string;
}

const FILE = 'ticket-uploads.json';

function load(): PendingUpload[] {
  const limit = Date.now() - 24 * 3600000;
  return readJson<PendingUpload[]>(FILE, []).filter((u) => new Date(u.at).getTime() > limit);
}

export function registerUpload(file: TicketFile, by: string, ticketId: string) {
  writeJson(FILE, [...load(), { ...file, by, ticketId, at: new Date().toISOString() }]);
}

export function takeUploads(ids: unknown, by: string, ticketId: string): TicketFile[] {
  if (!Array.isArray(ids) || !ids.length) return [];
  const wanted = new Set(ids.map(String).slice(0, 6));
  const list = load();
  const taken = list.filter((u) => wanted.has(u.id) && u.by === by && u.ticketId === ticketId);
  writeJson(FILE, list.filter((u) => !taken.includes(u)));
  return taken.map(({ id, name, size }) => ({ id, name, size }));
}
