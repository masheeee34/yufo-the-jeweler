import fs from 'fs';
import path from 'path';

// Images jointes aux demandes sur mesure : stockées hors de public/ (data/uploads),
// servies par /api/uploads/<nom>. Le nom est aléatoire et sert d'identifiant.
export const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');
export const UPLOAD_NAME = /^[a-f0-9]{32}\.(jpg|png|webp|gif)$/;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_ATTACHMENTS = 6;

export const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

// Type réel du fichier d'après ses premiers octets (on ne fait pas confiance au nom ni au type annoncé).
export function sniffImage(buf: Buffer): keyof typeof MIME | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buf.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  return null;
}

export function uploadExists(name: string): boolean {
  return UPLOAD_NAME.test(name) && fs.existsSync(path.join(UPLOADS_DIR, name));
}

// Une image est encore utilisée si son nom apparaît dans un des fichiers de data/ (demandes, créations, avis, réglages…).
export function uploadReferenced(name: string): boolean {
  const dir = path.join(process.cwd(), 'data');
  return fs.readdirSync(dir).some((f) => f.endsWith('.json') && fs.readFileSync(path.join(dir, f), 'utf-8').includes(name));
}
