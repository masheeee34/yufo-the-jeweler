import { readJson, writeJson } from './jsonStore';
import { InternalNote } from './requestsDb';

// Informations internes sur un client (jamais visibles par lui), indexées par l'id du compte.
export interface CustomerRecord {
  notes: InternalNote[];
  tags: string[];
  discountPercent?: number;
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
