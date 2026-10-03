import crypto from 'crypto';
import { readJson, writeJson } from './jsonStore';
import { InternalNote } from './requestsDb';

// Notification visible par le client (cloche de l'en-tête).
export interface ClientNotification {
  id: string;
  type: 'discount' | 'order' | 'project' | 'files';
  title: string;
  text: string;
  href?: string;
  percent?: number; // pour une réduction : révélée en grattant la carte
  at: string;
  read?: boolean;
  revealed?: boolean;
  dismissed?: boolean;
}

// Informations internes sur un client, indexées par l'id du compte.
// Les notes ne sont jamais visibles par lui ; les notifications, si.
export interface CustomerRecord {
  notes: InternalNote[];
  tags: string[];
  discountPercent?: number;
  notifications?: ClientNotification[];
}

export function getCustomerRecords(): Record<string, CustomerRecord> {
  return readJson<Record<string, CustomerRecord>>('customers.json', {});
}

export function getCustomerRecord(id: string): CustomerRecord {
  return getCustomerRecords()[id] || { notes: [], tags: [] };
}

export function saveCustomerRecord(id: string, rec: CustomerRecord) {
  const all = getCustomerRecords();
  all[id] = rec;
  writeJson('customers.json', all);
}

// Ajoute une notification au client (les 30 plus récentes sont gardées).
export function notifyCustomer(userId: string, n: Omit<ClientNotification, 'id' | 'at'>) {
  const rec = getCustomerRecord(userId);
  const list = [{ ...n, id: crypto.randomBytes(6).toString('hex'), at: new Date().toISOString() }, ...(rec.notifications || [])];
  rec.notifications = list.slice(0, 30);
  saveCustomerRecord(userId, rec);
}
