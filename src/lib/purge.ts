import fs from 'fs';
import path from 'path';
import { getRequests, saveRequests } from './requestsDb';
import { getGrants, saveGrants } from './filesDb';
import { getCustomerRecords, saveCustomerRecord } from './customersDb';
import { getAudit } from './team';
import { writeJson } from './jsonStore';
import { UPLOADS_DIR, uploadExists, uploadReferenced } from './uploads';

export const TICKET_FILES_DIR = path.join(process.cwd(), 'data', 'ticket-files');
export const TICKET_FILE_NAME = /^[a-f0-9]{32}\.[a-z0-9]{1,6}$/;

// Suppression définitive d'une demande (projet sur mesure / ticket) : conversation, images et fichiers
// joints, accès aux fichiers, notifications et traces du journal qui la concernent.
export function purgeRequest(id: string): { removedImages: number; removedFiles: number; removedGrants: number } | null {
  const requests = getRequests();
  const r = requests.find((x) => x.id === id);
  if (!r) return null;

  const images = new Set<string>([...r.messages.flatMap((m) => m.attachments || []), ...(r.project?.previews || []).map((p) => p.file)]);
  const files = r.messages.flatMap((m) => (m.files || []).map((f) => f.id));
  // Tickets reliés : ils restent, mais ne pointent plus vers la demande supprimée.
  for (const x of requests) if (x.linkedId === id) delete x.linkedId;
  saveRequests(requests.filter((x) => x !== r));

  const grants = getGrants();
  const keptGrants = grants.filter((g) => g.refId !== id);
  if (keptGrants.length !== grants.length) saveGrants(keptGrants);

  const records = getCustomerRecords();
  for (const [userId, rec] of Object.entries(records)) {
    const kept = (rec.notifications || []).filter((n) => !`${n.title} ${n.text || ''} ${n.href || ''} ${n.key || ''}`.includes(id));
    if (kept.length !== (rec.notifications || []).length) saveCustomerRecord(userId, { ...rec, notifications: kept });
  }

  writeJson('audit.json', getAudit().filter((e) => e.target !== id));

  let removedImages = 0;
  for (const name of images) {
    if (!uploadExists(name) || uploadReferenced(name)) continue;
    try {
      fs.unlinkSync(path.join(UPLOADS_DIR, name));
      removedImages++;
    } catch {}
  }
  let removedFiles = 0;
  for (const name of files) {
    if (!TICKET_FILE_NAME.test(name)) continue;
    try {
      fs.unlinkSync(path.join(TICKET_FILES_DIR, name));
      removedFiles++;
    } catch {}
  }
  return { removedImages, removedFiles, removedGrants: grants.length - keptGrants.length };
}
