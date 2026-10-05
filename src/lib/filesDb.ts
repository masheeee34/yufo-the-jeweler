import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { readJson, writeJson } from './jsonStore';
import { getProducts } from './productsDb';
import { getUsers, UserProfile } from './usersDb';
import { ClientRequest } from './requestsDb';
import { belongsTo, orderInfo } from './commerce';

// Gestionnaire de fichiers : fichiers livrables (.ydd, .ytd, .zip…) versionnés, rangés hors du site public
// dans data/files/<id>/. Les accès des clients sont des « grants » révocables.
export const FILES_DIR = path.join(process.cwd(), 'data', 'files');
export const MAX_FILE_BYTES = 100 * 1024 * 1024; // limite aussi fixée par nginx (100 Mo)
export const ALLOWED_EXT = ['ydd', 'ytd', 'yft', 'ymt', 'ybn', 'zip', 'rar', '7z', 'png', 'jpg', 'jpeg', 'webp'];

export interface FileVersion {
  v: number;
  stored: string; // nom sur le disque, dans data/files/<id>/
  originalName: string;
  size: number;
  sha256: string;
  uploadedAt: string;
  uploadedBy: string;
  note?: string;
}

export interface FileAsset {
  id: string;
  name: string;
  description?: string;
  versions: FileVersion[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Grant {
  id: string;
  fileId: string;
  userId: string;
  source: 'order' | 'project' | 'manual';
  refId?: string; // commande ou projet à l'origine de l'accès
  grantedAt: string;
  grantedBy: string;
  revokedAt?: string;
  revokedBy?: string;
  downloads: number;
  lastDownloadAt?: string;
}

export const getFiles = () => readJson<FileAsset[]>('files.json', []);
export const saveFiles = (list: FileAsset[]) => writeJson('files.json', list);
export const getGrants = () => readJson<Grant[]>('grants.json', []);
export const saveGrants = (list: Grant[]) => writeJson('grants.json', list);

export const currentVersion = (f: FileAsset) => f.versions[f.versions.length - 1];
export const newId = (prefix: string) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

export function extOf(name: string) {
  return (name.split('.').pop() || '').toLowerCase();
}

export function versionPath(fileId: string, stored: string) {
  if (!/^file_[a-f0-9]{16}$/.test(fileId) || !/^[\w.-]+$/.test(stored)) throw new Error('Invalid file path');
  return path.join(FILES_DIR, fileId, stored);
}

// Créations qui utilisent un fichier.
export function productsUsing(fileId: string) {
  return getProducts().filter((p) => !p.deletedAt && (p.fileIds || []).includes(fileId)).map((p) => ({ id: p.id, name: p.name }));
}

// Compte client d'une commande (Discord en priorité).
export function ownerOf(r: ClientRequest): UserProfile | null {
  const users = getUsers();
  const u =
    (r.userId ? users.find((x) => x.id === r.userId) : undefined) ||
    users.find((x) => x.discordId && x.discordId === r.discordId) ||
    users.find((x) => belongsTo(r, x));
  if (!u) return null;
  const { passwordHash: _h, salt: _s, ...profile } = u;
  return profile;
}

// Donne un accès (ou réactive un accès révoqué). Renvoie true si quelque chose a changé.
export function grantAccess(grants: Grant[], fileId: string, userId: string, source: Grant['source'], refId: string | undefined, by: string): boolean {
  const existing = grants.find((g) => g.fileId === fileId && g.userId === userId);
  if (existing) {
    if (!existing.revokedAt) return false;
    existing.revokedAt = undefined;
    existing.revokedBy = undefined;
    existing.grantedAt = new Date().toISOString();
    existing.grantedBy = by;
    return true;
  }
  grants.push({ id: newId('grant'), fileId, userId, source, refId, grantedAt: new Date().toISOString(), grantedBy: by, downloads: 0 });
  return true;
}

// Achat payé → accès automatique aux fichiers des créations commandées.
export function grantForOrder(r: ClientRequest, by: string): { granted: number; owner: UserProfile | null } {
  const owner = ownerOf(r);
  if (!owner) return { granted: 0, owner: null };
  const products = getProducts();
  const o = orderInfo(r);
  const fileIds = new Set<string>();
  for (const item of o.items) {
    const p = products.find((x) => (item.productId && x.id === item.productId) || (item.reference && x.reference === item.reference) || x.name === item.name);
    (p?.fileIds || []).forEach((id) => fileIds.add(id));
  }
  const grants = getGrants();
  let granted = 0;
  for (const fileId of fileIds) if (grantAccess(grants, fileId, owner.id, 'order', r.id, by)) granted++;
  if (granted) saveGrants(grants);
  return { granted, owner };
}

export function ensureDir(fileId: string) {
  fs.mkdirSync(path.join(FILES_DIR, fileId), { recursive: true });
}
